from asyncache import cached
from cachetools import TTLCache
from sqlalchemy.ext.asyncio import AsyncSession

from server.constants import TTL_FIVE_MINUTES
from server.models import WaitingRoom


async def fetch_waiting_room(session: AsyncSession, waiting_room_id: str) -> WaitingRoom | None:
    """
    Fetch a waiting room by ID
    This is cached for 5 minutes, as we don't expect waiting rooms to change once published

    :param session: The database session to use
    :param waiting_room_id: The ID of the waiting room to fetch
    """
    @cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES))
    async def _cached_fetch_waiting_room(_waiting_room_id: str) -> WaitingRoom | None:
        return await session.get(WaitingRoom, ident=_waiting_room_id)

    return await _cached_fetch_waiting_room(waiting_room_id)
