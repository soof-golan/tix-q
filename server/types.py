import datetime
import typing
from typing import TypedDict

import httpx
from pydantic import BaseModel
from pydantic.generics import GenericModel
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from starlette.authentication import BaseUser


class State(TypedDict):
    http_client: httpx.AsyncClient
    db: async_sessionmaker[AsyncSession]


DataT = typing.TypeVar("DataT")


class TrpcData(GenericModel, typing.Generic[DataT]):
    data: DataT


class TrpcResponse(GenericModel, typing.Generic[DataT]):
    result: TrpcData[DataT]


class FirebasePayload(TypedDict):
    identities: dict[str, list[str]]
    sign_in_provider: str


class FirebaseJwt(TypedDict):
    name: str | None
    iss: str
    aud: str
    auth_time: int
    user_id: str
    sub: str
    iat: int
    exp: int
    email: str
    firebase: FirebasePayload


class FirebaseUser(BaseUser):
    def __init__(self, token: FirebaseJwt):
        self.token = token

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def display_name(self) -> str:
        return self.token.get("name", "")

    @property
    def identity(self) -> str:
        return self.token.get("sub", "")

    @property
    def email(self) -> str:
        return self.token.get("email", "")


class TurnstileOutcome(BaseModel):
    """
    Models most of the response from the turnstile API
    More details: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

    """

    success: bool
    challenge_ts: datetime.datetime | None  # Verify people don't submit too early
    error_codes: list[str]
    hostname: str | None = None
    action: str | None = None
    data: dict | None = None

    @classmethod
    def NO_TOKEN(cls):
        return cls(success=False, error_codes=["no-token"])

