import datetime
import logging
from typing import cast, TypeVar

import fastapi
import httpx
from prisma import models
from pydantic import BaseModel
from starlette.authentication import requires

from server.config import CONFIG
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
    published: bool


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
            "AND": [{"ownerId": request.state.user.id}],
        },
        data={
            "title": room.title,
            "markdown": room.markdown,
            "opensAt": room.opensAt,
            "closesAt": room.closesAt,
        },
    )
    if updated != 1:
        raise fastapi.HTTPException(status_code=400, detail="Invalid waiting room ID")
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
    client = cast(httpx.AsyncClient, request.state.client)
    if CONFIG.deploy_hook_url:
        await client.post(url=CONFIG.deploy_hook_url)
    else:
        logging.error("Deploy hook not configured")

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
