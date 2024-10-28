import fastapi

from .constants import PLAY_NICE_RESPONSE
from .types import TurnstileOutcome
from .logger import logger


def handle_turnstile_errors(outcome: TurnstileOutcome, name: str) -> None:
    """
    This user might be a bot.
    So better wear protection :)
    """
    if outcome.success:
        return
    logger.error("Bot mitigation error %s", outcome)
    if not outcome.error_codes:
        raise fastapi.HTTPException(
            status_code=403,
            detail="Invalid turnstile token" + PLAY_NICE_RESPONSE.format(name=name),
        )
    if "timeout-or-duplicate" in outcome.error_codes:
        raise fastapi.HTTPException(
            status_code=403,
            detail="Duplicate turnstile token" + PLAY_NICE_RESPONSE.format(name=name),
        )
    if "invalid-input-response" in outcome.error_codes:
        raise fastapi.HTTPException(
            status_code=403,
            detail="Invalid turnstile token" + PLAY_NICE_RESPONSE.format(name=name),
        )
    if "missing-input-response" in outcome.error_codes:
        raise fastapi.HTTPException(
            status_code=403,
            detail="Missing turnstile token" + PLAY_NICE_RESPONSE.format(name=name),
        )
    if not outcome.challenge_ts:
        raise fastapi.HTTPException(
            status_code=400,
            detail="missing challenge_ts." + PLAY_NICE_RESPONSE.format(name=name),
        )
    raise fastapi.HTTPException(
        status_code=403,
        detail="Invalid turnstile token" + PLAY_NICE_RESPONSE.format(name=name),
    )
