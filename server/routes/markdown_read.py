import datetime
import json
from typing import Annotated
from urllib.parse import unquote

import fastapi
from fastapi import Query
from prisma import models
from pydantic import BaseModel
from starlette.authentication import requires

from server.types import TrpcData, TrpcResponse

router = fastapi.APIRouter()


def decode_trpc_input(escaped_input: str) -> dict:
    json_str = unquote(unquote(escaped_input))
    return json.loads(json_str)


class WaitingRoomReadRequest(BaseModel):
    id: str


class WaitingRoomReadResponse(BaseModel):
    id: str
    markdown: str
    title: str
    updatedAt: datetime.datetime
    createdAt: datetime.datetime


@router.get("/markdown.read")
@requires("authenticated", status_code=401)
async def read_waiting_room_content(request: fastapi.Request, input: Annotated[str, Query()]) -> TrpcResponse[WaitingRoomReadResponse]:
    """
    Read the markdown contents of a waiting room

    Parameters:
        - input: The request to read the waiting room input=${encodeURIComponent(JSON.stringify(input))}

    """
    req = WaitingRoomReadRequest.parse_obj(decode_trpc_input(input))
    room = await models.WaitingRoom.prisma().find_first(where={
        "AND": [
            {
                "id": req.id
            },
            {
                "ownerId": request.state.user.id
            }
        ]
    })
    if not room:
        raise fastapi.HTTPException(status_code=400, detail="Invalid waiting room ID")

    return TrpcResponse(
        result=TrpcData(
            data=WaitingRoomReadResponse(
                id=room.id,
                markdown=room.markdown,
                title=room.title,
                createdAt=room.createdAt,
                updatedAt=room.updatedAt,
            )
        )
    )
