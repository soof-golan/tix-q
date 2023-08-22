import datetime
from typing import Annotated, cast

import fastapi
import httpx
import sqlalchemy
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy import insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.authentication import requires

from server.models import IdType, WaitingRoom, Registrant as DbRegistrant
from server.config import CONFIG
from server.db.session import db_session
from server.logger import logger
from server.trpc import trpc, TrpcMixin
from server.types import TrpcResponse

router = fastapi.APIRouter()


class RoomQuery(BaseModel, TrpcMixin):
    id: str
    title: str
    markdown: str
    createdAt: datetime.datetime
    updatedAt: datetime.datetime
    opensAt: datetime.datetime
    closesAt: datetime.datetime
    published: bool


class RoomMutation(BaseModel):
    id: str
    title: str
    markdown: str
    opensAt: datetime.datetime
    closesAt: datetime.datetime


class RoomId(BaseModel, TrpcMixin):
    id: str


@router.get("/room.readMany")
@requires("authenticated", status_code=401)
async def read_many(
    request: fastapi.Request,
    db: Annotated[AsyncSession, Depends(db_session)],
) -> TrpcResponse[list[RoomQuery]]:
    rooms_iterable = await db.scalars(
        select(WaitingRoom)
        .where(WaitingRoom.owner_id == str(request.state.user.id))
        .order_by(WaitingRoom.created_at.desc())
    )
    return trpc(
        [
            RoomQuery(
                id=str(room.id),
                title=room.title,
                markdown=room.markdown,
                createdAt=room.created_at,
                updatedAt=room.updated_at,
                opensAt=room.opens_at,
                closesAt=room.closes_at,
                published=room.published,
            )
            for room in rooms_iterable
        ]
    )


@router.get("/room.readUnique")
@requires("authenticated", status_code=401)
async def read_unique(
    request: fastapi.Request,
    query: Annotated[RoomId, Depends(RoomId.from_trpc)],
    session: Annotated[AsyncSession, Depends(db_session)],
) -> TrpcResponse[RoomQuery]:
    room = await session.scalar(
        select(WaitingRoom)
        .where(WaitingRoom.id == query.id)
        .where(WaitingRoom.owner_id == request.state.user.id)
    )
    if room is None:
        raise fastapi.HTTPException(status_code=401, detail="Invalid waiting room ID")

    return RoomQuery(
        id=str(room.id),
        title=room.title,
        markdown=room.markdown,
        createdAt=room.created_at,
        updatedAt=room.updated_at,
        opensAt=room.opens_at,
        closesAt=room.closes_at,
        published=room.published,
    ).trpc


class RoomStats(BaseModel, TrpcMixin):
    id: str
    registrantsCount: int


@router.get("/room.stats")
@requires("authenticated", status_code=401)
async def stats(
    request: fastapi.Request,
    query: Annotated[RoomId, Depends(RoomId.from_trpc)],
    session: Annotated[AsyncSession, Depends(db_session)],
) -> TrpcResponse[RoomStats]:
    count: int = (
        await session.execute(
            select(sqlalchemy.func.count())
            .select_from(DbRegistrant)
            .where(DbRegistrant.waiting_room_id == query.id)
            .where(WaitingRoom.owner_id == request.state.user.id)
        )
    ).scalar_one()

    return RoomStats(
        id=str(query.id),
        registrantsCount=count,
    ).trpc


class Registrant(BaseModel):
    id: str
    legalName: str
    email: str
    phoneNumber: str
    idNumber: str
    idType: IdType
    turnstileSuccess: bool
    turnstileTimestamp: datetime.datetime | None

    createdAt: datetime.datetime
    updatedAt: datetime.datetime


class RoomRegistrants(BaseModel, TrpcMixin):
    id: str
    registrants: list[Registrant]


@router.get("/room.registrants")
@requires("authenticated", status_code=401)
async def registrants(
    request: fastapi.Request,
    query: Annotated[RoomId, Depends(RoomId.from_trpc)],
    session: Annotated[AsyncSession, Depends(db_session)],
) -> TrpcResponse[RoomRegistrants]:
    result = await session.scalars(
        select(DbRegistrant)
        .where(DbRegistrant.waiting_room_id == query.id)
        .where(WaitingRoom.owner_id == request.state.user.id)
        .order_by(DbRegistrant.created_at.asc())
    )

    return RoomRegistrants(
        id=query.id,
        registrants=[
            Registrant(
                id=registrant.id,
                legalName=registrant.legal_name,
                email=registrant.email,
                phoneNumber=registrant.phone_number,
                idNumber=registrant.id_number,
                idType=registrant.id_type,
                turnstileSuccess=registrant.turnstile_success,
                turnstileTimestamp=registrant.turnstile_timestamp,
                createdAt=registrant.created_at,
                updatedAt=registrant.updated_at,
            )
            for registrant in result
        ],
    ).trpc


class RoomCreateRequest(BaseModel):
    title: str
    markdown: str
    opensAt: datetime.datetime
    closesAt: datetime.datetime


@router.post("/room.create")
@requires("authenticated", status_code=401)
async def create(
    request: fastapi.Request,
    new_room: RoomCreateRequest,
    session: Annotated[AsyncSession, Depends(db_session)],
) -> TrpcResponse[RoomQuery]:
    async with session.begin():
        statement = (
            insert(WaitingRoom)
            .values(
                title=new_room.title,
                markdown=new_room.markdown,
                owner_id=request.state.user.id,
                opens_at=new_room.opensAt,
                closes_at=new_room.closesAt,
                published=False,
            )
            .returning(WaitingRoom)
        )
        result = (await session.execute(statement)).scalar_one()
        return RoomQuery(
            id=str(result.id),
            title=result.title,
            markdown=result.markdown,
            createdAt=result.created_at,
            updatedAt=result.updated_at,
            opensAt=result.opens_at,
            closesAt=result.closes_at,
            published=result.published,
        ).trpc


@router.post("/room.update")
@requires("authenticated", status_code=401)
async def room_update(
    request: fastapi.Request,
    room: RoomMutation,
    session: Annotated[AsyncSession, Depends(db_session)],
) -> TrpcResponse[RoomQuery]:
    async with session.begin():
        statement = (
            update(WaitingRoom)
            .where(WaitingRoom.id == room.id)
            .where(WaitingRoom.owner_id == request.state.user.id)
            .values(
                title=room.title,
                markdown=room.markdown,
                opens_at=room.opensAt,
                closes_at=room.closesAt,
            )
            .returning(WaitingRoom)
        )
        result = (await session.execute(statement)).scalar_one()
        return RoomQuery(
            id=str(result.id),
            title=result.title,
            markdown=result.markdown,
            createdAt=result.created_at,
            updatedAt=result.updated_at,
            opensAt=result.opens_at,
            closesAt=result.closes_at,
            published=result.published,
        ).trpc


@router.post("/room.publish")
@requires("authenticated", status_code=401)
async def publish(
    request: fastapi.Request,
    room: RoomId,
    session: Annotated[AsyncSession, Depends(db_session)],
) -> TrpcResponse[RoomQuery]:
    async with session.begin():
        statement = (
            update(WaitingRoom)
            .where(WaitingRoom.id == room.id)
            .where(WaitingRoom.owner_id == request.state.user.id)
            .values(published=True)
            .returning(WaitingRoom)
        )
        result = (await session.execute(statement)).scalar_one()
        session.expunge(result)


    # TODO: Limit deploy hook rate
    if CONFIG.production:
        await trigger_deployment(request)

    return RoomQuery(
        id=str(result.id),
        title=result.title,
        markdown=result.markdown,
        createdAt=result.created_at,
        updatedAt=result.updated_at,
        opensAt=result.opens_at,
        closesAt=result.closes_at,
        published=result.published,
    ).trpc


async def trigger_deployment(request: fastapi.Request):
    """
    Trigger a deployment of the frontend, this will force the builder to "pre-render" all published waiting rooms

    We use GitHubs API to re-trigger the CI workflow

    https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28#create-a-workflow-dispatch-event

    Equivalent cURL command:

    curl -L \
      -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer <YOUR-TOKEN>"\
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/OWNER/REPO/actions/workflows/WORKFLOW_ID/dispatches \
      -d '{"ref":"topic-branch","inputs":{"name":"Mona the Octocat","home":"San Francisco, CA"}}'

    """
    if (
        not CONFIG.github_token
        or not CONFIG.github_repo
        or not CONFIG.github_workflow_id
    ):
        logger.error("Missing GitHub config, skipping deployment trigger")
        raise fastapi.HTTPException(
            status_code=500,
            detail="Missing GitHub config, cannot trigger deployment",
        )
    logger.info("Triggering deployment")
    url = f"https://api.github.com/repos/{CONFIG.github_repo}/actions/workflows/{CONFIG.github_workflow_id}/dispatches"
    client = cast(httpx.AsyncClient, request.state.http_client)
    response = await client.post(
        url=url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {CONFIG.github_token}",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        json={
            "ref": "main",
        },
    )
    logger.info(f"Triggered deployment: {response.status_code} {response.text}")
