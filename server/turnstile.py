import datetime

import fastapi
from pydantic import BaseModel

from .config import CONFIG
from .constants import PLAY_NICE_RESPONSE


class TurnstileOutcome(BaseModel):
    """
    Models most of the response from the turnstile API
    More details: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

    """
    success: bool
    challenge_ts: datetime.datetime | None = None  # Verify people don't submit too early
    error_codes: list[str]
    hostname: str | None = None
    action: str | None = None
    data: dict | None = None


async def validate_turnstile(request: fastapi.Request, token: str | None, name: str = "stranger") -> TurnstileOutcome:
    """
    Validate the turnstile token
    As documented in https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

    This operation is *not* idempotent. successive calls with 'valid' tokens
    will fail with 'timeout-or-duplicate' errors. this means clients should only call this once.
    It is very important that we don't add caching to this function as it will help
    attackers bypass the turnstile with one valid token and then use it multiple times.

    """
    client = request.state.http_client
    response = await client.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify/",
        timeout=5,
        data={
            "secret": CONFIG.turnstile_secret,  # Our secret
            "response": token,  # Came from the client
        },
    )
    response.raise_for_status()
    data = response.json()
    try:
        challenge_ts = datetime.datetime.fromisoformat(data["challenge_ts"])
    except (KeyError, ValueError):
        raise fastapi.HTTPException(status_code=500, detail="Invalid turnstile token (challenge_ts)" + PLAY_NICE_RESPONSE.format(name=name))
    return TurnstileOutcome(
        success=data["success"],
        challenge_ts=challenge_ts,
        error_codes=data.get("error-codes", []),
        hostname=data.get("hostname"),
        action=data.get("action"),
        data=data,
    )


def handle_turnstile_errors(outcome: TurnstileOutcome, name: str) -> None:
    """
    This user might be a bot.
    So better wear protection :)
    """
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
