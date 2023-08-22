import uuid

from asyncache import cached
from cachetools import TTLCache
from pydantic import BaseModel
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from server.constants import TTL_FIVE_MINUTES
from server.models import User as DbUser
from server.types import FirebaseUser


class User(BaseModel):
    id: uuid.UUID
    firebase_uid: str
    email: str


async def fetch_or_create_cached_user(
    session: AsyncSession, user: FirebaseUser
) -> User:
    """
    Fetch or create a user by their Firebase UID
    This is cached for 5 minutes as user records are immutable
    """

    @cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES))
    async def _cached_fetch_or_create_user(_user: FirebaseUser) -> User:
        async with session.begin_nested():
            stmt = (
                insert(DbUser)
                .values(firebase_uid=_user.identity, email=_user.email)
                .on_conflict_do_update(
                    index_elements=[DbUser.firebase_uid],
                    set_={DbUser.email: _user.email},
                )
                .returning(DbUser)
            )
            _result = (await session.execute(stmt)).scalar_one()
            result = User(
                id=_result.id, firebase_uid=_result.firebase_uid, email=_result.email
            )
        return result

    return await _cached_fetch_or_create_user(user)
