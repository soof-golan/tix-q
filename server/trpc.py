import json
from typing import TypeVar
from urllib.parse import unquote

from pydantic import BaseModel

from server.types import TrpcData, TrpcResponse


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
        return cls.parse_obj(decode_trpc_input(input))
