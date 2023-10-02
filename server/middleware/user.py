from starlette.authentication import UnauthenticatedUser
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import Request
from starlette.responses import Response

from server.db.session import create_session_maker
from server.db.user import fetch_or_create_cached_user
from server.logger import logger
from server.types import FirebaseUser


class UserMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add the user to the request state
    """

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        user: FirebaseUser | UnauthenticatedUser = request.scope.get("user")
        if not user.is_authenticated:
            return await call_next(request)
        logger.debug("[%] Found firebase user in request scope", user.identity)
        async with create_session_maker(request)() as session:
            request.state.user = await fetch_or_create_cached_user(session, user)
        logger.debug("[%s] Logged in", request.state.user.id)
        return await call_next(request)
