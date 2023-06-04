import datetime

import fastapi
from prisma import errors, models
from pydantic import BaseModel

from server.firebase import FirebaseMiddleware
from server.types import TrpcData, TrpcResponse, State

app = fastapi.FastAPI()
app.add_middleware(FirebaseMiddleware)


class WaitingRoomEditRequest(BaseModel):
    id: str
    markdown: str
    title: str


class WaitingRoomEditResponse(BaseModel):
    id: str
    markdown: str
    title: str
    updatedAt: datetime.datetime


@app.post("/")
async def edit_waiting_room_content(request: fastapi.Request, edit_request: WaitingRoomEditRequest) -> TrpcResponse[WaitingRoomEditResponse]:
    """
    Edit the markdown contents of a waiting room

    Parameters:

    - edit_request: The request to edit the waiting room

    Returns:

    - TrpcResponse[WaitingRoomEditResponse]: The response containing the updated waiting room
    """
    try:
        result = await models.WaitingRoom.prisma().update_many(
            where={
                # Ensure the user owns the waiting room
                "AND": [
                    {
                        "ownerId": request.state.user.id,
                    },
                    {
                        "id": edit_request.id,
                    }
                ]
            },
            data={
                "markdown": edit_request.markdown,
                "title": edit_request.title,
            },
        )
        if result != 1:
            raise fastapi.HTTPException(status_code=400, detail="Invalid waiting room ID")
        room = await models.WaitingRoom.prisma().find_unique(where={"id": edit_request.id})
    except errors.RecordNotFoundError:
        raise fastapi.HTTPException(status_code=400, detail="Invalid waiting room ID")

    return TrpcResponse(
        result=TrpcData(
            data=WaitingRoomEditResponse(
                id=room.id,
                markdown=room.markdown,
                title=room.title,
                updatedAt=room.updatedAt,
            )
        )
    )
