import typing
from typing import TypedDict

import httpx
from prisma import enums, Prisma
from pydantic import BaseModel, EmailStr, UUID4
from pydantic.generics import GenericModel


class State(TypedDict):
    http_client: httpx.AsyncClient
    turnstile_secret: str
    db: Prisma


class ParticipantRegisterRequest(BaseModel):
    # DB Record
    legalName: str
    email: EmailStr
    phoneNumber: str
    idNumber: str
    idType: enums.IdType
    waitingRoomId: str


class ParticipantRegisterResponse(BaseModel):
    # DB Record
    id: UUID4
    legalName: str
    email: EmailStr
    phoneNumber: str
    idNumber: str
    idType: enums.IdType
    waitingRoomId: str


DataT = typing.TypeVar("DataT")


class TrpcData(GenericModel, typing.Generic[DataT]):
    data: DataT


class TrpcResponse(GenericModel, typing.Generic[DataT]):
    result: TrpcData[DataT]
