import json
from typing import TypeVar
from urllib.parse import unquote

import fastapi
import pydantic
from pydantic import BaseModel

from .types import TrpcData, TrpcResponse


def decode_trpc_input(escaped_input: str) -> dict:
    json_str = unquote(unquote(escaped_input))
    return json.loads(json_str)


T = TypeVar("T")


def trpc(data: T) -> TrpcResponse[T]:
    return TrpcResponse(result=TrpcData(data=data))


class TrpcMixin:
    @property
    def trpc(self: T) -> TrpcResponse[T]:
        return trpc(self)

    @classmethod
    def from_trpc(cls: type[BaseModel], input: str) -> T:
        try:
            return cls.model_validate(decode_trpc_input(input))
        except pydantic.ValidationError as e:
            raise fastapi.HTTPException(
                status_code=422,
                detail=e.errors(),
            )
