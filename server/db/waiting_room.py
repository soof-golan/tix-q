from asyncache import cached
from cachetools import TTLCache
from prisma import models

from server.constants import TTL_FIVE_MINUTES


@cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES))
async def fetch_waiting_room(waiting_room_id: str) -> models.WaitingRoom | None:
    return await models.WaitingRoom.prisma().find_unique(where={"id": waiting_room_id})
