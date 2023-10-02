import uuid
from typing import Annotated

from asyncache import cached
from cachetools import TTLCache
from fastapi import Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession
from starlette.authentication import UnauthenticatedUser
from starlette.requests import Request

from server.constants import TTL_FIVE_MINUTES
from server.db.session import db_session
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
        async with session.begin():
            stmt = (
                insert(DbUser)
                .values(firebase_uid=_user.identity, email=_user.email)
                .on_conflict_do_update(
                    index_elements=[DbUser.firebase_uid],
                    set_={DbUser.email: _user.email},
                )
                .returning(DbUser.id, DbUser.firebase_uid, DbUser.email)
            )
            _result = (await session.execute(stmt)).one()
            await session.commit()
            result = User(
                id=_result[0], firebase_uid=_result[1], email=_result[2]
            )
        return result

    return await _cached_fetch_or_create_user(user)


async def authenticated_user(
    request: Request,
    conn: Annotated[AsyncConnection, Depends(db_session)],
) -> User:
    """
    Get the user from the request state
    """
    _user: FirebaseUser | UnauthenticatedUser = request.scope.get("user")
    if not _user.is_authenticated:
        raise HTTPException(
            status_code=401,
            detail="You must be logged in to perform this action",
        )
    return await fetch_or_create_cached_user(conn, _user)
