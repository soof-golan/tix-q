import atexit
import flask
import functions_framework
import pydantic
import requests
from flask import Request
from pydantic import UUID4, BaseModel, EmailStr

from prisma import Prisma, enums, models, register, types

# Cold boot
db = Prisma() 
register(db)
db.connect()
atexit.register(db.disconnect)

def validate_turnstile(request: Request) -> bool:
    return True
    token = request.headers.get('X-Turnstile-Token')
    if not token:
        flask.abort(400, 'Missing captcha token')

    # TODO: Validate token
    # requests.get(url="https://api.turnstile.workers.dev/validate", params={"token": token})
    pass


class PrticipantRegisterRequest(BaseModel):
    # DB Record
    legalName: str
    email: EmailStr
    phoneNumber: str
    idNumber: str
    idType: enums.IdType
    waitingRoomId: str


def create_participant(request: Request):
    # Validate request
    try:
        validated = PrticipantRegisterRequest.parse_raw(request.data)
    except pydantic.ValidationError as e:
        flask.abort(400, f'Failed to validate request: {e}')
    
    # TODO: turnstile

    result = models.Registrant.prisma().create(
        data={
            "legalName": validated.legalName,
            "email": validated.email,
            "phoneNumber": validated.phoneNumber,
            "idNumber": validated.idNumber,
            "idType": validated.idType,
            "waitingRoomId": validated.waitingRoomId,
        }
    )
    return result.json()
    


@functions_framework.http
def register(request: Request):
    if request.method == 'POST':
        return create_participant(request)
    if request.method == 'OPTIONS':
        # CORS is allowed for all origins
        return flask.Response(
            status=204,
            headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Turnstile-Token',
            }
        )
    else:
        flask.abort(405, 'Method not allowed')
