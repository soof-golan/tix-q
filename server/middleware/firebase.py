import json
import typing
from functools import partial

import asyncer
import firebase_admin
import starlette.middleware.authentication
from asyncache import cachedmethod
from cachetools import TTLCache
from cachetools.keys import hashkey
from firebase_admin import auth
from starlette.authentication import AuthCredentials, AuthenticationError
from starlette.requests import HTTPConnection

from ..constants import TTL_FIVE_MINUTES
from ..logger import logger
from ..types import FirebaseUser


class FirebaseAuthBackend(starlette.middleware.authentication.AuthenticationBackend):
    def __init__(self, name: str = "FirebaseAuthBackend", credential: str = None):
        """
        Initialize the Firebase App for the authentication backend
        The rest of the logic is handled by starlette (see https://www.starlette.io/authentication/)
        """
        self.cache = TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES)
        try:
            self.fb_app = firebase_admin.get_app(name)
        except ValueError:
            if credential is None:
                raise ValueError("Firebase credential is required")
            if isinstance(credential, str):
                try:
                    # Attempt to parse the credential as JSON
                    credential = json.loads(credential)
                except json.JSONDecodeError:
                    # Credential may be a file path, let Firebase handle it
                    pass
            self.fb_app = firebase_admin.initialize_app(
                name=name, credential=firebase_admin.credentials.Certificate(credential)
            )

    @cachedmethod(cache=lambda self: self.cache, key=partial(hashkey, "decode_token"))
    async def decode_token(self, credentials: str) -> dict:
        return await asyncer.asyncify(auth.verify_id_token)(
            credentials, app=self.fb_app, check_revoked=False
        )

    async def authenticate(
        self, conn: HTTPConnection
    ) -> typing.Optional[typing.Tuple[AuthCredentials, FirebaseUser]]:
        """
        Authenticate the user using the Authorization header
        We only support OAuth2 bearer tokens created by Firebase

        Parameters:
            conn (HTTPConnection): The HTTP connection to authenticate

        Returns:

        """
        if "Authorization" not in conn.headers:
            return

        bearer = conn.headers["Authorization"]

        try:
            scheme, _space, credentials = bearer.partition(" ")
            if scheme.lower() != "bearer":
                logger.debug("Authorization scheme is not bearer")
                raise AuthenticationError("Authorization scheme is not bearer")
        except ValueError:
            logger.exception("Invalid authorization scheme")
            raise AuthenticationError("Invalid authorization scheme")

        try:
            decoded = await self.decode_token(credentials)
            return AuthCredentials(["authenticated"]), FirebaseUser(decoded)
        except (
            ValueError,
            auth.InvalidIdTokenError,
            auth.ExpiredIdTokenError,
            auth.RevokedIdTokenError,
            auth.CertificateFetchError,
            auth.UnexpectedResponseError,
            auth.UserDisabledError,
        ):
            logger.exception("Invalid authorization header")
            raise AuthenticationError("Invalid authorization header")
