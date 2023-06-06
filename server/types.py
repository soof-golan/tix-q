import typing
from typing import TypedDict

import httpx
from prisma import Prisma
from pydantic.generics import GenericModel
from starlette.authentication import BaseUser


class State(TypedDict):
    http_client: httpx.AsyncClient
    turnstile_secret: str
    db: Prisma


DataT = typing.TypeVar("DataT")


class TrpcData(GenericModel, typing.Generic[DataT]):
    data: DataT


class TrpcResponse(GenericModel, typing.Generic[DataT]):
    result: TrpcData[DataT]


class FirebasePayload(TypedDict):
    identities: dict[str, list[str]]
    sign_in_provider: str


class FirebaseJwt(TypedDict):

    name: str
    iss: str
    aud: str
    auth_time: int
    user_id: str
    sub: str
    iat: int
    exp: int
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
