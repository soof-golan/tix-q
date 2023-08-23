"""
db Connection utility
"""
from typing import Annotated, cast

import fastapi
from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
)


def create_session_maker(request: fastapi.Request) -> async_sessionmaker[AsyncSession]:
    """
    Get a database session from the request state
    """
    return cast(async_sessionmaker[AsyncSession], request.state.db)


async def db_session(
    session_maker: Annotated[async_sessionmaker[AsyncSession], Depends(create_session_maker)]
) -> AsyncSession:
    """
    Get a database session from the request state
    """
    async with session_maker() as session:
        yield session

