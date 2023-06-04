import logging

import fastapi
import firebase_admin
from asyncer import asyncify
from firebase_admin import auth
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class FirebaseMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: fastapi.FastAPI, credential: str | None = None, name: str = "FirebaseMiddleware", options: dict | None = None):
        super().__init__(app)
        self.name = name
        try:
            self.fb_app = firebase_admin.get_app(name=name)
        except ValueError:
            self.fb_app = firebase_admin.initialize_app(credential=credential, name=name, options=options)

    async def dispatch(self, request: fastapi.Request, call_next) -> fastapi.Response:
        """
        Middleware to add the firebase user to the request state
        """
        # Allow OPTIONS requests, TODO: can be removed?
        if request.method == "OPTIONS":
            logger.debug("Allowing OPTIONS request")
            return await call_next(request)

        bearer = request.headers.get("Authorization", "")

        if not bearer:
            logger.error("Missing authorization header")
            return fastapi.Response(status_code=401, content="Missing authorization header")

        if not bearer.startswith("Bearer "):
            logger.error("Invalid authorization header (does not start with 'Bearer ')")
            return fastapi.Response(status_code=401, content="Invalid authorization header")

        # Remove the "Bearer " prefix
        try:
            token = bearer[7:]
        except IndexError:
            logger.error("Invalid authorization header (does not start with 'Bearer ')")
            return fastapi.Response(status_code=401, content="Invalid authorization header")

        # Verify the token
        try:
            decoded = await asyncify(auth.verify_id_token)(token, app=self.fb_app, check_revoked=False)
            logger.debug(f"Decoded token: uid={decoded['uid']}")
        except (
                ValueError,
                auth.InvalidIdTokenError,
                auth.ExpiredIdTokenError,
                auth.RevokedIdTokenError,
                auth.CertificateFetchError,
                auth.UnexpectedResponseError,
                auth.UserDisabledError,
        ):
            logger.exception("Failed to verify token (invalid/expired/revoked)")
            return fastapi.Response(status_code=401, content="Invalid authorization header")

        # Add the user to the request state
        logger.debug("injecting user into request state")
        request.state.user = decoded

        return await call_next(request)
