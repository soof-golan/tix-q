import uuid
from typing import Annotated

from asyncache import cached
from cachetools import TTLCache
from cachetools.keys import methodkey
from fastapi import Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession
from starlette.authentication import UnauthenticatedUser
from starlette.requests import Request

from ..constants import TTL_FIVE_MINUTES
from ..db.session import db_session
from ..models import User as DbUser
from ..types import FirebaseUser


class User(BaseModel):
    id: uuid.UUID
    firebase_uid: str
    email: str


@cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES), key=methodkey)
async def fetch_or_create_cached_user(
    session: AsyncSession, user: FirebaseUser
) -> User:
    """
    Fetch or create a user by their Firebase UID
    This is cached for 5 minutes as user records are immutable
    """

    async with session.begin():
        stmt = (
            insert(DbUser)
            .values(firebase_uid=user.identity, email=user.email)
            .on_conflict_do_update(
                index_elements=[DbUser.firebase_uid],
                set_={DbUser.email: user.email},
            )
            .returning(DbUser.id, DbUser.firebase_uid, DbUser.email)
        )
        _result = (await session.execute(stmt)).one()
        await session.commit()
        result = User(id=_result[0], firebase_uid=_result[1], email=_result[2])
    return result


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
