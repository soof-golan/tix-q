from typing import Annotated

import fastapi
from fastapi import Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import UUID4, BaseModel, EmailStr

from prisma import Prisma, enums, errors, models, register, types

app = fastapi.FastAPI()

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
    allow_headers=["X-Turnstile-Token"],
)


@app.on_event("startup")
async def start():
    """
    Cold start
    """
    db = Prisma()
    register(db)
    await db.connect()
    app.db = db
    

@app.on_event("shutdown")
async def shutdown():
    await app.db.disconnect()


class TurnstileOutcome(BaseModel):
    success: bool
    

async def validate_turnstile(token: str | None) -> TurnstileOutcome:
    """
    Validate the turnstile token
    As documented in https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
    """
    # TODO: This is a stub, implement the real thing
    return TurnstileOutcome(success=True)


class PrticipantRegisterRequest(BaseModel):
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

@app.post('/')
async def create_participant(data: PrticipantRegisterRequest, x_turnstile_token: Annotated[str | None, Header()] = None) -> ParticipantRegisterResponse:
    outcome = await validate_turnstile(x_turnstile_token)

    if not outcome.success:
        raise fastapi.HTTPException(status_code=400, detail="Invalid turnstile token")

    try:
        result = await models.Registrant.prisma().create(
            data={
                "legalName": data.legalName,
                "email": data.email,
                "phoneNumber": data.phoneNumber,
                "idNumber": data.idNumber,
                "idType": data.idType,
                "waitingRoomId": data.waitingRoomId,
            }
        )
        return result.dict()
    except errors.ForeignKeyViolationError:
        raise fastapi.HTTPException(status_code=400, detail="Invalid waiting room ID")
    except errors.RecordNotFoundError:
        raise fastapi.HTTPException(status_code=500, detail="Internal server error (table not found)")
    except errors.DataError as e:
        raise fastapi.HTTPException(status_code=500, detail=repr(e.data) or "Invalid data")
    except errors.ClientNotConnectedError:
        raise fastapi.HTTPException(status_code=500, detail="Internal server error (db not connected)")
    
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

