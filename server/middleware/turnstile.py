import logging
from datetime import datetime

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from server.config import CONFIG
from server.types import TurnstileOutcome

logger = logging.getLogger(__name__)


class TurnstileMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate Cloudflare's Turnstile token

    Tokens are sent in the X-Turnstile-Token header
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """
        Validate the turnstile token
        """
        token = request.headers.get("X-Turnstile-Token")
        if token is None:
            logger.debug("No turnstile token provided")
            request.state.turnstile_outcome = TurnstileOutcome.NO_TOKEN()
            return await call_next(request)

        client = request.state.http_client
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify/",
            timeout=5,
            data={
                "secret": CONFIG.turnstile_secret,  # Our secret
                "response": token,  # Came from the client
            },
        )

        data = response.json()
        try:
            challenge_ts = datetime.fromisoformat(data["challenge_ts"])
        except (KeyError, ValueError):
            logger.debug("Invalid turnstile token (challenge_ts)")
            request.state.turnstile_outcome = TurnstileOutcome(
                success=False,
                challenge_ts=None,
                error_codes=data.get("error-codes", []),
                hostname=data.get("hostname"),
                action=data.get("action"),
                data=data,
            )
            return await call_next(request)

        request.state.turnstile_outcome = TurnstileOutcome(
            success=data["success"],
            challenge_ts=challenge_ts,
            error_codes=data.get("error-codes", []),
            hostname=data.get("hostname"),
            action=data.get("action"),
            data=data,
        )

        return await call_next(request)
