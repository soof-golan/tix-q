import datetime

import fastapi
from pydantic import BaseModel

from .constants import PLAY_NICE_RESPONSE


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
