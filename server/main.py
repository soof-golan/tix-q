import contextlib
import datetime
import os
import typing
from typing import Annotated, TypedDict

import fastapi
from asyncache import cached
from cachetools import TTLCache
from fastapi import Cookie
from fastapi.middleware.cors import CORSMiddleware
from pydantic import UUID4, BaseModel, EmailStr, Field
import httpx

from prisma import Prisma, enums, errors, models, register
from pydantic.generics import GenericModel

TTL_FIVE_MINUTES = 60 * 5


class State(TypedDict):
    http_client: httpx.AsyncClient
    turnstile_secret: str
    db: Prisma


@contextlib.asynccontextmanager
async def lifespan(_app: fastapi.FastAPI) -> typing.AsyncIterator[State]:
    turnstile_secret = os.environ.get("TURNSTILE_SECRET", "secret")
    db = Prisma()
    register(db)
    await db.connect()
    async with httpx.AsyncClient() as client:
        yield {
            "http_client": client,
            "turnstile_secret": turnstile_secret,
            "db": db,
        }
    await db.disconnect()


app = fastapi.FastAPI(lifespan=lifespan)

# TODO: Are these the right origins?
origins = [
    "http://localhost:8080",
    "http://localhost:3000",
    "https://waitingroom.soofgolan.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["X-CSRF-Token"],
)

PLAY_NICE_RESPONSE = """
Hey {name}!,
I know going to this event is important to you, but please don't hack me.
I'm running this as a free service for the community, and I'm doing my best to make sure everyone gets a fair chance.
If you think this is a mistake, please contact me.
If you're running a bot, please stop.
Toodles ❤️
Soof
"""


class TurnstileOutcome(BaseModel):
    success: bool
    challenge_ts: datetime.datetime | None = None  # Verify people don't submit too early
    error_codes: list[str]
    hostname: str | None = None
    action: str | None = None
    data: dict | None = None


async def validate_turnstile(request: fastapi.Request, token: str | None) -> TurnstileOutcome:
    """
    Validate the turnstile token
    As documented in https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
    """
    client = request.state.http_client
    turnstile_secret = request.state.turnstile_secret
    response = await client.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify/",
        timeout=5,
        data={
            "secret": turnstile_secret,  # Our secret
            "response": token,  # Came from the client
        },
    )
    response.raise_for_status()
    data = response.json()
    try:
        challenge_ts = datetime.datetime.fromisoformat(data["challenge_ts"])
    except (KeyError, ValueError):
        raise fastapi.HTTPException(status_code=500, detail="Invalid turnstile token (challenge_ts)" + PLAY_NICE_RESPONSE.format(name="stranger"))
    return TurnstileOutcome(
        success=data["success"],
        challenge_ts=challenge_ts,
        error_codes=data.get("error-codes", []),
        hostname=data.get("hostname"),
        action=data.get("action"),
        data=data,
    )


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


def handle_turnstile_errors(outcome: TurnstileOutcome, name: str) -> None:
    if outcome.success:
        return
    if not outcome.error_codes:
        raise fastapi.HTTPException(status_code=400, detail="Invalid turnstile token" + PLAY_NICE_RESPONSE.format(name=name))
    if "timeout-or-duplicate" in outcome.error_codes:
        raise fastapi.HTTPException(status_code=400, detail="Duplicate turnstile token" + PLAY_NICE_RESPONSE.format(name=name))
    if "invalid-input-response" in outcome.error_codes:
        raise fastapi.HTTPException(status_code=400, detail="Invalid turnstile token" + PLAY_NICE_RESPONSE.format(name=name))
    if "missing-input-response" in outcome.error_codes:
        raise fastapi.HTTPException(status_code=400, detail="Missing turnstile token" + PLAY_NICE_RESPONSE.format(name=name))
    raise fastapi.HTTPException(status_code=400, detail="Invalid turnstile token" + PLAY_NICE_RESPONSE.format(name=name))


@cached(cache=TTLCache(maxsize=1024, ttl=TTL_FIVE_MINUTES))
async def fetch_waiting_room(waiting_room_id: str) -> models.WaitingRoom | None:
    return await models.WaitingRoom.prisma().find_unique(where={"id": waiting_room_id})


@app.post("/register")
async def create_participant(
        request: fastapi.Request,
        data: ParticipantRegisterRequest,
        turnstile_token: Annotated[str | None, Cookie()] = None,
) -> TrpcResponse[ParticipantRegisterResponse]:
    outcome = await validate_turnstile(request, turnstile_token)

    # This user might be a bot. We don't allow bots to register.
    handle_turnstile_errors(outcome, data.legalName)

    # Verify the waiting room is open at the time of registration
    room = await fetch_waiting_room(data.waitingRoomId)
    if room is None:
        # Failed lookup, probably Invalid waiting room ID
        raise fastapi.HTTPException(status_code=400, detail="Invalid waiting room ID" + PLAY_NICE_RESPONSE.format(name=data.legalName))

    # Someone is trying to register too late
    if outcome.challenge_ts > room.closesAt:
        # TODO: handle this case in the client
        raise fastapi.HTTPException(status_code=400, detail="Too late to register" + PLAY_NICE_RESPONSE.format(name=data.legalName))

    try:
        result = await models.Registrant.prisma().create(
            data={
                "legalName": data.legalName,
                "email": data.email,
                "phoneNumber": data.phoneNumber,
                "idNumber": data.idNumber,
                "idType": data.idType,
                "waitingRoomId": data.waitingRoomId,
                "turnstileTimestamp": outcome.challenge_ts,
                "turnstileSuccess": outcome.success,
            }
        )
    except errors.ForeignKeyViolationError:
        raise fastapi.HTTPException(status_code=400, detail="Invalid waiting room ID" + PLAY_NICE_RESPONSE.format(name=data.legalName))
    except errors.RecordNotFoundError:
        raise fastapi.HTTPException(
            status_code=500, detail="Internal server error (table not found)" + PLAY_NICE_RESPONSE.format(name=data.legalName)
        )
    except errors.DataError as e:
        raise fastapi.HTTPException(
            status_code=500, detail=repr(e.data) or "Invalid data" + PLAY_NICE_RESPONSE.format(name=data.legalName)
        )
    except errors.ClientNotConnectedError:
        raise fastapi.HTTPException(
            status_code=500, detail="Internal server error (db not connected)" + PLAY_NICE_RESPONSE.format(name=data.legalName)
        )
    else:
        # Someone is trying to register too early
        # We'll still record the request, but we won't return a success response
        if outcome.challenge_ts < room.opensAt:
            raise fastapi.HTTPException(
                status_code=400,
                detail=f"Too early to register." + PLAY_NICE_RESPONSE.format(name=data.legalName) + "\nbtw this request was recorded."
            )

        return {
            "result": {
                "data": result.dict()
            }
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
