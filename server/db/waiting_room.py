import uuid
from datetime import datetime

from asyncache import cached
from cachetools import TTLCache
from cachetools.keys import methodkey
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..constants import TTL_FIVE_MINUTES
from ..models import WaitingRoom


class CachedWaitingRoomQueryResult(BaseModel):
    id: uuid.UUID
    opens_at: datetime
    closes_at: datetime


@cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES), key=methodkey)
async def fetch_waiting_room(
    session: AsyncSession, waiting_room_id: str
) -> CachedWaitingRoomQueryResult | None:
    """
    Fetch a waiting room by ID
    This is cached for 5 minutes, as we don't expect waiting rooms to change once published

    :param session: The database session to use
    :param waiting_room_id: The ID of the waiting room to fetch
    """

    _room = await session.execute(
        (
            select(WaitingRoom.id, WaitingRoom.opens_at, WaitingRoom.closes_at)
            .where(WaitingRoom.id == waiting_room_id)
            .where(WaitingRoom.published == True)
        )
    )

    room = _room.one_or_none()
    if room is None:
        return None
    return CachedWaitingRoomQueryResult(
        id=room[0],
        opens_at=room[1],
        closes_at=room[2],
    )
