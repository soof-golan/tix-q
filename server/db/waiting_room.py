import uuid
from datetime import datetime, UTC
from typing import cast

from asyncache import cached
from cachetools import TTLCache
from cachetools.keys import methodkey
from pydantic import BaseModel, AwareDatetime
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from ..constants import TTL_FIVE_MINUTES
from ..models import WaitingRoom


class CachedWaitingRoomQueryResult(BaseModel):
    id: uuid.UUID
    opens_at: AwareDatetime
    closes_at: AwareDatetime


@cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES), key=methodkey)
async def fetch_waiting_room(
    session: AsyncSession,
    waiting_room_id: str,
    maybe_user_id: str | None,
) -> CachedWaitingRoomQueryResult | None:
    """
    Fetch a waiting room by ID
    This is cached for 5 minutes, as we don't expect waiting rooms to change once published

    :param session: The database session to use
    :param waiting_room_id: The ID of the waiting room to fetch
    """
    if maybe_user_id is not None:
        cond = or_(WaitingRoom.published == True, WaitingRoom.owner_id == maybe_user_id)
    else:
        cond = WaitingRoom.published == True

    _room = await session.execute(
        (
            select(WaitingRoom.id, WaitingRoom.opens_at, WaitingRoom.closes_at)
            .where(WaitingRoom.id == waiting_room_id)
            .where(cond)
        )
    )

    room = _room.one_or_none()
    if room is None:
        return None
    return CachedWaitingRoomQueryResult(
        id=room[0],
        # Re attach UTC timezone
        opens_at=cast(datetime, room[1]).replace(tzinfo=UTC),
        closes_at=cast(datetime, room[2]).replace(tzinfo=UTC),
    )
