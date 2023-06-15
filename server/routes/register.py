import logging
import uuid
from typing import cast

import fastapi
import orjson
from prisma import enums, errors, models
from pydantic import BaseModel, constr, EmailStr, UUID4

from server.constants import PLAY_NICE_RESPONSE
from server.db.waiting_room import fetch_waiting_room
from server.trpc import TrpcMixin
from server.turnstile import handle_turnstile_errors
from server.types import TrpcResponse, TurnstileOutcome

router = fastapi.APIRouter()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())


class RegisterRequest(BaseModel):
    # DB Record
    legalName: constr(strip_whitespace=True, min_length=1, max_length=255)
    email: EmailStr
    phoneNumber: constr(strip_whitespace=True, min_length=1, max_length=255)
    idNumber: constr(strip_whitespace=True, min_length=1, max_length=255)
    idType: enums.IdType
    waitingRoomId: uuid.UUID


class RegisterResponse(BaseModel, TrpcMixin):
    # DB Record
    id: UUID4
    legalName: str
    email: EmailStr
    phoneNumber: str
    idNumber: str
    idType: enums.IdType
    waitingRoomId: str


@router.post("/register")
async def create_participant(
    request: fastapi.Request,
    data: RegisterRequest,
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
    outcome = cast(TurnstileOutcome, request.state.turnstile_outcome)

    # Verify the waiting room is open at the time of registration
    room = await fetch_waiting_room(str(data.waitingRoomId))
    if room is None:
        # Failed lookup, probably Invalid waiting room ID
        raise fastapi.HTTPException(
            status_code=400,
            detail="Invalid waiting room ID"
            + PLAY_NICE_RESPONSE.format(name=data.legalName),
        )

    registrant = {
        "legalName": data.legalName,
        "email": data.email,
        "phoneNumber": data.phoneNumber,
        "idNumber": data.idNumber,
        "idType": data.idType,
        "waitingRoomId": str(data.waitingRoomId),
        "turnstileTimestamp": outcome.challenge_ts,
        "turnstileSuccess": outcome.success,
    }

    logline = orjson.dumps(registrant).decode("utf-8")
    logger.info(logline)

    if outcome.challenge_ts is None:
        raise fastapi.HTTPException(
            status_code=400,
            detail=f"missing challenge_ts."
            + PLAY_NICE_RESPONSE.format(name=data.legalName)
            + "\nbtw this request was recorded.",
        )

    # Someone is trying to register too early
    # We recorded the request, but we won't return a success response
    if outcome.challenge_ts < room.opensAt:
        raise fastapi.HTTPException(
            status_code=400,
            detail=f"Too early to register."
            + PLAY_NICE_RESPONSE.format(name=data.legalName)
            + "\nbtw this request was recorded.",
        )

    # Someone is trying to register too late
    if outcome.challenge_ts > room.closesAt:
        raise fastapi.HTTPException(
            status_code=400,
            detail="Too late to register"
            + PLAY_NICE_RESPONSE.format(name=data.legalName),
        )

    try:
        result = await models.Registrant.prisma().create(data=registrant)
    except errors.ForeignKeyViolationError:
        raise fastapi.HTTPException(
            status_code=400,
            detail="Invalid waiting room ID"
            + PLAY_NICE_RESPONSE.format(name=data.legalName),
        )
    except errors.RecordNotFoundError:
        raise fastapi.HTTPException(
            status_code=500,
            detail="Internal server error (table not found)"
            + PLAY_NICE_RESPONSE.format(name=data.legalName),
        )
    except errors.DataError as e:
        raise fastapi.HTTPException(
            status_code=500,
            detail=repr(e.data)
            or "Invalid data" + PLAY_NICE_RESPONSE.format(name=data.legalName),
        )
    except errors.ClientNotConnectedError:
        raise fastapi.HTTPException(
            status_code=500,
            detail="Internal server error (db not connected)"
            + PLAY_NICE_RESPONSE.format(name=data.legalName),
        )
    else:
        handle_turnstile_errors(outcome, data.legalName)

        return RegisterResponse(
            id=result.id,
            email=result.email,
            legalName=result.legalName,
            phoneNumber=result.phoneNumber,
            idNumber=result.idNumber,
            idType=result.idType,
            waitingRoomId=result.waitingRoomId,
        ).trpc
