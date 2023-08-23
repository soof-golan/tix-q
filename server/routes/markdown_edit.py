import datetime
from typing import Annotated

import fastapi
from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.authentication import requires

from server.db.session import db_session
from server.models import WaitingRoom
from server.types import TrpcData, TrpcResponse

router = fastapi.APIRouter()


class WaitingRoomEditRequest(BaseModel):
    id: str
    markdown: str
    title: str


class WaitingRoomEditResponse(BaseModel):
    id: str
    markdown: str
    title: str
    updatedAt: datetime.datetime


@router.post("/markdown.edit")
@requires("authenticated", status_code=401)
async def edit_waiting_room_content(
    request: fastapi.Request,
    edit_request: WaitingRoomEditRequest,
    session: Annotated[AsyncSession, Depends(db_session)],
) -> TrpcResponse[WaitingRoomEditResponse]:
    """
    Edit the markdown contents of a waiting room

    Parameters:

    - edit_request: The request to edit the waiting room

    Returns:

    - TrpcResponse[WaitingRoomEditResponse]: The response containing the updated waiting room
    """
    async with session.begin():
        room = (
            await session.execute(
                update(WaitingRoom)
                .where(WaitingRoom.id == edit_request.id)
                .where(WaitingRoom.owner_id == request.user.id)
                .values(
                    markdown=edit_request.markdown,
                    title=edit_request.title,
                )
                .returning(WaitingRoom)
            )
        ).scalar_one()

    return TrpcResponse(
        result=TrpcData(
            data=WaitingRoomEditResponse(
                id=room.id,
                markdown=room.markdown,
                title=room.title,
                updatedAt=room.updated_at,
            )
        )
    )
