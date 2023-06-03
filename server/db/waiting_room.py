from asyncache import cached
from cachetools import TTLCache
from prisma import models

from server.constants import TTL_FIVE_MINUTES


@cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES))
async def fetch_waiting_room(waiting_room_id: str) -> models.WaitingRoom | None:
    """
    Fetch a waiting room by ID
    This is cached for 5 minutes, as we don't expect waiting rooms to change once published

    :param waiting_room_id: The ID of the waiting room to fetch
    """
    return await models.WaitingRoom.prisma().find_unique(where={"id": waiting_room_id})
