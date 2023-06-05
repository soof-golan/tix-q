import contextlib
import os
import typing

import fastapi
import httpx
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.middleware.gzip import GZipMiddleware

from server.firebase import FirebaseAuthBackend
from .routes import markdown as markdown_routes
from .routes import register as register_routes
from .types import State


@contextlib.asynccontextmanager
async def lifespan(_app: fastapi.FastAPI) -> typing.AsyncIterator[State]:
    """
    Handle application lifespan events

    __aenter__ is called when the application starts
    When the application starts we want to:
     - connect to the database
     - create an HTTP client (for making requests to the turnstile)
     - Load secrets from the environment

    __aexit__ is called when the application stops
    When the application stops we want to:
     - disconnect from the database

    """
    async with httpx.AsyncClient() as client, Prisma(auto_register=True, use_dotenv=True, log_queries=True) as db:
        yield {
            "http_client": client,
            "turnstile_secret": os.environ.get("TURNSTILE_SECRET", "change_me"),
            "db": db,
        }


app = fastapi.FastAPI(lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["X-CSRF-Token"],
)
app.add_middleware(AuthenticationMiddleware, backend=FirebaseAuthBackend())

app.mount("/register", register_routes.app)
app.mount("/markdown.edit", markdown_routes.app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
