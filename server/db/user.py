from asyncache import cached
from cachetools import TTLCache
from prisma import models

from server.constants import TTL_FIVE_MINUTES
from server.types import FirebaseUser


@cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES))
async def fetch_or_create_cached_user(user: FirebaseUser) -> models.User:
    """
    Fetch or create a user by their Firebase UID
    This is cached for 5 minutes as user records are immutable
    """
    return await models.User.prisma().upsert(where={"firebaseUid": user.identity}, data={
        "create": {
            "firebaseUid": user.identity,
            "email": user.email
        },
        "update": {
            "email": user.email
        },
    })
