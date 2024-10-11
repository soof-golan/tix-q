import uuid
from typing import Annotated, cast

import fastapi
import orjson
from fastapi import Depends
from pydantic import BaseModel, constr, EmailStr, UUID4, SecretStr, Field, BeforeValidator, StringConstraints
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from ..constants import PLAY_NICE_RESPONSE
from ..db.session import db_session
from ..db.waiting_room import CachedWaitingRoomQueryResult, fetch_waiting_room
from ..logger import logger
from ..models import IdType, Registrant, Burnerot
from ..trpc import TrpcMixin
from ..turnstile import handle_turnstile_errors
from ..types import TrpcResponse, TurnstileOutcome

router = fastapi.APIRouter()


class RegisterRequest(BaseModel):
    # DB Record
    legalName: constr(strip_whitespace=True, min_length=1, max_length=255)
    email: EmailStr
    phoneNumber: constr(strip_whitespace=True, min_length=1, max_length=255)
    idNumber: constr(strip_whitespace=True, min_length=1, max_length=255)
    idType: IdType
    burnerot: Burnerot
    waitingRoomId: uuid.UUID


class RegisterResponse(BaseModel, TrpcMixin):
    # DB Record
    id: UUID4
    legalName: str
    email: EmailStr
    phoneNumber: str
    idNumber: str
    idType: IdType
    burnerot: Burnerot | None = None
    waitingRoomId: str


def turnstile_outcome(request: fastapi.Request) -> TurnstileOutcome:
    """
    Get the turnstile outcome from the request state
    """
    return cast(TurnstileOutcome, request.state.turnstile_outcome)


async def waiting_room(
    data: RegisterRequest,
    session: Annotated[AsyncSession, Depends(db_session)],
) -> CachedWaitingRoomQueryResult:
    """
    Query the database for the waiting room

    :raises fastapi.HTTPException: If the waiting room ID is invalid
    """

    room = await fetch_waiting_room(session, str(data.waitingRoomId))
    if room is None:
        # Failed lookup, probably Invalid waiting room ID
        raise fastapi.HTTPException(
            status_code=400,
            detail="Invalid waiting room ID"
            + PLAY_NICE_RESPONSE.format(name=data.legalName),
        )
    return room


@router.post("/register")
async def create_participant(
    data: RegisterRequest,
    outcome: Annotated[TurnstileOutcome, Depends(turnstile_outcome)],
    room: Annotated[CachedWaitingRoomQueryResult, Depends(waiting_room)],
    session: Annotated[AsyncSession, Depends(db_session)],
) -> TrpcResponse[RegisterResponse]:
    """
    Register a participant for a waiting room

    Things that happen here:
    - Validate the turnstile token (make sure this is a real person)
        - If the token is invalid, return an error to the client (this will not be recorded in the database)
        - If the token is valid, continue
    - Verify the waiting room is open at the time of registration
        - Given a form was submitted too early (by someone opening the client source code and sending a request)
          We'll still record the registration, but we'll return an error to the client
          This will allow event organizers to see who tried to register too early and disqualify them (if they want to)
        - Given a form was submitted too late, we'll return an error to the client
          This will not be recorded in the database (as the event owner already closed the waiting room)
    - Create a new participant
        - This step only validates the foreign key constraints (waiting room ID)
        - If the waiting room ID is invalid, return an error to the client (i.e they tried to register for
          a waiting room that doesn't exist, again, someone is trying to "hack" us)
    - Return the new participant ID
        - this will be displayed on the client as "Your number registration number is: X"
    """
    registrant = {
        "legalName": data.legalName,
        "email": data.email,
        "phoneNumber": data.phoneNumber,
        "idNumber": data.idNumber,
        "idType": data.idType,
        "burnerot": data.burnerot,
        "waitingRoomId": str(data.waitingRoomId),
        "turnstileTimestamp": outcome.challenge_ts,
        "turnstileSuccess": outcome.success,
    }

    logger.info(orjson.dumps(registrant).decode("utf-8"))

    await session.commit()
    result = await session.execute(
        insert(Registrant)
        .values(
            legal_name=data.legalName,
            email=data.email,
            phone_number=data.phoneNumber,
            id_number=data.idNumber,
            id_type=data.idType,
            waiting_room_id=data.waitingRoomId,
            burnerot=data.burnerot,
            turnstile_success=outcome.success,
            turnstile_timestamp=outcome.challenge_ts,
        )
        .returning(Registrant.id)
    )
    await session.commit()

    _id = result.scalars().first()

    if not outcome.challenge_ts:
        logger.error("Bot mitigation error %s", outcome.error_codes)
        raise fastapi.HTTPException(
            status_code=400,
            detail=f"missing challenge_ts."
            + PLAY_NICE_RESPONSE.format(name=data.legalName)
            + "\nbtw this request was recorded.",
        )
    # Someone is trying to register too late
    if outcome.challenge_ts > room.closes_at:
        raise fastapi.HTTPException(
            status_code=400,
            detail="Too late to register"
                   + PLAY_NICE_RESPONSE.format(name=data.legalName)
                   + "\nbtw this request was recorded.",
        )
    if outcome.challenge_ts < room.opens_at:
        # Someone is trying to register too early
        # We recorded the request, but we won't return a success response
        raise fastapi.HTTPException(
            status_code=400,
            detail=f"Too early to register."
            + PLAY_NICE_RESPONSE.format(name=data.legalName)
            + "\nbtw this request was recorded.",
        )

    handle_turnstile_errors(outcome, data.legalName)

    return RegisterResponse(
        id=str(_id),
        email=data.email,
        legalName=data.legalName,
        phoneNumber=data.phoneNumber,
        idNumber=data.idNumber,
        idType=data.idType,
        waitingRoomId=str(data.waitingRoomId),
        burnerot=data.burnerot,
    ).trpc
