import datetime
import logging
from typing import cast, TypeVar

import fastapi
import httpx
from prisma import enums, models
from pydantic import BaseModel
from starlette.authentication import requires

from server.config import CONFIG
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
) -> TrpcResponse[list[RoomQuery]]:
    rooms = await models.WaitingRoom.prisma().find_many(
        where={"ownerId": request.state.user.id},
        order={
            "createdAt": "desc",
        },
    )
    return trpc(
        [
            RoomQuery(
                id=room.id,
                title=room.title,
                markdown=room.markdown,
                createdAt=room.createdAt,
                updatedAt=room.updatedAt,
                opensAt=room.opensAt,
                closesAt=room.closesAt,
                published=room.published,
            )
            for room in rooms
        ]
    )


@router.get("/room.readUnique")
@requires("authenticated", status_code=401)
async def read_many(request: fastapi.Request, input: str) -> TrpcResponse[RoomQuery]:
    query = RoomId.from_trpc(input)
    results = await models.WaitingRoom.prisma().find_many(
        where={
            "ownerId": request.state.user.id,
            "AND": {
                "id": query.id,
            },
        },
    )
    if len(results) != 1:
        raise fastapi.HTTPException(status_code=401, detail="Invalid waiting room ID")

    room = results[0]
    return RoomQuery(
        id=room.id,
        title=room.title,
        markdown=room.markdown,
        createdAt=room.createdAt,
        updatedAt=room.updatedAt,
        opensAt=room.opensAt,
        closesAt=room.closesAt,
        published=room.published,
    ).trpc


class RoomStats(BaseModel, TrpcMixin):
    id: str
    registrantsCount: int


@router.get("/room.stats")
@requires("authenticated", status_code=401)
async def read_many(request: fastapi.Request, input: str) -> TrpcResponse[RoomStats]:
    query = RoomId.from_trpc(input)
    results = await models.Registrant.prisma().count(
        where={
            "waitingRoomId": query.id,
            "AND": {
                "WaitingRoom": {
                    "ownerId": request.state.user.id,
                },
            },
        },
    )
    return RoomStats(
        id=query.id,
        registrantsCount=results,
    ).trpc


class Registrant(BaseModel):
    id: str
    legalName: str
    email: str
    phoneNumber: str
    idNumber: str
    idType: enums.IdType
    turnstileSuccess: bool
    turnstileTimestamp: datetime.datetime | None

    createdAt: datetime.datetime
    updatedAt: datetime.datetime


class RoomRegistrants(BaseModel, TrpcMixin):
    id: str
    registrants: list[Registrant]


@router.get("/room.registrants")
@requires("authenticated", status_code=401)
async def read_many(
    request: fastapi.Request, input: str
) -> TrpcResponse[RoomRegistrants]:
    query = RoomId.from_trpc(input)
    results = await models.Registrant.prisma().find_many(
        where={
            "waitingRoomId": query.id,
            "AND": {
                "WaitingRoom": {
                    "ownerId": request.state.user.id,
                },
            },
        },
        order={
            "createdAt": "asc",
        },
    )
    return RoomRegistrants(
        id=query.id,
        registrants=[
            Registrant(
                id=registrant.id,
                legalName=registrant.legalName,
                email=registrant.email,
                phoneNumber=registrant.phoneNumber,
                idNumber=registrant.idNumber,
                idType=registrant.idType,
                turnstileSuccess=registrant.turnstileSuccess,
                turnstileTimestamp=registrant.turnstileTimestamp,
                createdAt=registrant.createdAt,
                updatedAt=registrant.updatedAt,
            )
            for registrant in results
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
    request: fastapi.Request, new_room: RoomCreateRequest
) -> TrpcResponse[RoomQuery]:
    result = await models.WaitingRoom.prisma().create(
        data={
            "title": new_room.title,
            "markdown": new_room.markdown,
            "ownerId": request.state.user.id,
            "opensAt": new_room.opensAt,
            "closesAt": new_room.closesAt,
            "published": False,
        }
    )
    return RoomQuery(
        id=result.id,
        title=result.title,
        markdown=result.markdown,
        createdAt=result.createdAt,
        updatedAt=result.updatedAt,
        opensAt=result.opensAt,
        closesAt=result.closesAt,
        published=result.published,
    ).trpc


@router.post("/room.update")
@requires("authenticated", status_code=401)
async def update(
    request: fastapi.Request, room: RoomMutation
) -> TrpcResponse[RoomQuery]:
    updated = await models.WaitingRoom.prisma().update_many(
        where={
            "id": room.id,
            "AND": [
                {"ownerId": request.state.user.id},
                {"published": False},
            ],
        },
        data={
            "title": room.title,
            "markdown": room.markdown,
            "opensAt": room.opensAt,
            "closesAt": room.closesAt,
        },
    )
    if updated != 1:
        raise fastapi.HTTPException(
            status_code=400, detail="Invalid waiting room ID / already published"
        )
    result = await models.WaitingRoom.prisma().find_unique(where={"id": room.id})
    return RoomQuery(
        id=result.id,
        title=result.title,
        markdown=result.markdown,
        createdAt=result.createdAt,
        updatedAt=result.updatedAt,
        opensAt=result.opensAt,
        closesAt=result.closesAt,
        published=result.published,
    ).trpc


@router.post("/room.publish")
@requires("authenticated", status_code=401)
async def publish(request: fastapi.Request, room: RoomId) -> TrpcResponse[RoomQuery]:
    updated = await models.WaitingRoom.prisma().update_many(
        where={
            "id": room.id,
            "AND": [{"ownerId": request.state.user.id}],
        },
        data={
            "published": True,
        },
    )
    if updated != 1:
        raise fastapi.HTTPException(status_code=400, detail="Invalid waiting room ID")

    # TODO: Limit deploy hook rate
    if CONFIG.production:
        await trigger_deployment(request)

    result = await models.WaitingRoom.prisma().find_unique(where={"id": room.id})
    return RoomQuery(
        id=result.id,
        title=result.title,
        markdown=result.markdown,
        createdAt=result.createdAt,
        updatedAt=result.updatedAt,
        opensAt=result.opensAt,
        closesAt=result.closesAt,
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
