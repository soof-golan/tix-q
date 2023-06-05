import logging
import typing

import firebase_admin
import starlette.middleware.authentication
from firebase_admin import auth
from starlette.authentication import AuthCredentials, AuthenticationError
from starlette.requests import HTTPConnection

from server.types import FirebaseUser

logger = logging.getLogger(__name__)


class FirebaseAuthBackend(starlette.middleware.authentication.AuthenticationBackend):
    def __init__(self, name: str = "FirebaseAuthBackend", credential: str = None):
        """
        Initialize the Firebase App for the authentication backend
        The rest of the logic is handled by starlette (see https://www.starlette.io/authentication/)
        """
        try:
            self.fb_app = firebase_admin.get_app(name)
        except ValueError:
            self.fb_app = firebase_admin.initialize_app(
                name=name, credential=credential
            )

    async def authenticate(self, conn: HTTPConnection) -> typing.Optional[typing.Tuple[AuthCredentials, FirebaseUser]]:
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
            scheme, credentials = bearer.split(" ", 1)
            if scheme.lower() != "bearer":
                logger.debug("Authorization scheme is not bearer")
        except ValueError:
            raise AuthenticationError("Authorization scheme is not bearer")

        try:
            decoded = auth.verify_id_token(credentials, app=self.fb_app)
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
