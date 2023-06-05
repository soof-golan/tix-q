import datetime

import fastapi
from prisma import models

from pydantic import BaseModel
from starlette.authentication import requires

from server.types import TrpcData, TrpcResponse

router = fastapi.APIRouter()


class Room(BaseModel):
    id: str
    title: str
    markdown: str
    createdAt: datetime.datetime
    updatedAt: datetime.datetime
    opensAt: datetime.datetime
    closesAt: datetime.datetime


class RoomReadManyResponse(BaseModel):
    rooms: list[Room]


@router.get("/room.readMany")
@requires("authenticated", status_code=401)
async def room_read_many(request: fastapi.Request) -> TrpcResponse[RoomReadManyResponse]:
    rooms = await models.WaitingRoom.prisma().find_many(where={"ownerId": request.state.user.id}, order={
        "createdAt": "desc",
    })
    return TrpcResponse(
        result=TrpcData(
            data=RoomReadManyResponse(
                rooms=[
                    Room(
                        id=room.id,
                        title=room.title,
                        markdown=room.markdown,
                        createdAt=room.createdAt,
                        updatedAt=room.updatedAt,
                        opensAt=room.opensAt,
                        closesAt=room.closesAt,
                    )
                    for room in rooms
                ]
            )
        )
    )


class RoomCreateRequest(BaseModel):
    title: str
    markdown: str
    opensAt: datetime.datetime
    closesAt: datetime.datetime
    published: bool = False


class CreateRoomResponse(BaseModel):
    room: Room


@router.post("/room.create")
@requires("authenticated", status_code=401)
async def create_room(request: fastapi.Request, new_room: RoomCreateRequest) -> TrpcResponse[CreateRoomResponse]:
    result = await models.WaitingRoom.prisma().create(
        data={
            "title": new_room.title,
            "markdown": new_room.markdown,
            "ownerId": request.state.user.id,
            "opensAt": new_room.opensAt,
            "closesAt": new_room.closesAt,
            "published": new_room.published,
        }
    )
    return TrpcResponse(
        result=TrpcData(
            data=CreateRoomResponse(
                room=Room(
                    id=result.id,
                    title=result.title,
                    markdown=result.markdown,
                    createdAt=result.createdAt,
                    updatedAt=result.updatedAt,
                    opensAt=result.opensAt,
                    closesAt=result.closesAt,
                )
            )
        )
    )
