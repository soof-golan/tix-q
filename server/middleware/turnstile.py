import logging
from datetime import datetime

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
import httpx

from server.config import CONFIG
from server.logger import logger
from server.types import TurnstileOutcome



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

        client = request.state.cf_http_client
        response = await client.post(
            "/turnstile/v0/siteverify/",
            timeout=5,
            data={
                "secret": CONFIG.turnstile_secret,  # Our secret
                "response": token,  # Came from the client
            },
        )

        try:
            response.raise_for_status()
            data = response.json()
            challenge_ts = datetime.fromisoformat(data["challenge_ts"]).replace(tzinfo=None)
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
        except httpx.HTTPStatusError as e:
            logger.exception(
                "Error validating turnstile token: %s", e.response.text, exc_info=e
            )
            request.state.turnstile_outcome = TurnstileOutcome(
                success=False,
                challenge_ts=None,
                error_codes=[e.response.text],
                hostname=None,
                action=None,
                data=None,
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
