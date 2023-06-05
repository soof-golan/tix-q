from asyncache import cached
from cachetools import TTLCache
from prisma import models

from server.constants import TTL_FIVE_MINUTES


@cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES))
async def fetch_or_create_cached_user(firebase_uid: str) -> models.User:
    """
    Fetch or create a user by their Firebase UID
    This is cached for 5 minutes as user records are immutable
    """
    return await models.User.prisma().upsert(where={"firebaseUid": firebase_uid}, data={
        "create": {
            "firebaseUid": firebase_uid,
        },
        "update": {},
    })
