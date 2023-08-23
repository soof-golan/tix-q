import asyncio
import contextlib
import typing
from logging.config import dictConfig

import fastapi
import httpx
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.middleware.gzip import GZipMiddleware
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from timing_asgi import TimingClient, TimingMiddleware
from timing_asgi.integrations import StarletteScopeToName

from server.config import CONFIG
from server.constants import DEV_CORS_ORIGINS, log_config, PROD_CORS_ORIGINS
from server.logger import logger
from server.middleware.firebase import FirebaseAuthBackend
from server.middleware.turnstile import TurnstileMiddleware
from server.middleware.user import UserMiddleware
from .routes import markdown_edit
from .routes import register as register_routes
from .routes import room
from .types import State

dictConfig(log_config)


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
    engine = create_async_engine(CONFIG.database_url, echo=not CONFIG.production, hide_parameters=CONFIG.production)

    async_session = async_sessionmaker(engine)

    async with httpx.AsyncClient() as client:
        yield {
            "http_client": client,
            "db": async_session,
        }

    cleanup_coros = [
        engine.dispose(),
    ]
    await asyncio.gather(*cleanup_coros)


class TimingLogger(TimingClient):
    def timing(self, metric_name, timing, tags):
        logger.info("%s %s %s", metric_name, timing, tags)


app = fastapi.FastAPI(lifespan=lifespan)
app.add_middleware(
    TimingMiddleware,
    client=TimingLogger(),
    metric_namer=StarletteScopeToName(prefix="tix-q", starlette_app=app),
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=PROD_CORS_ORIGINS if CONFIG.production else DEV_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS", "GET"],
    allow_headers=[
        "X-CSRF-Token",
        "Authorization",
        "Content-Type",
        "X-Turnstile-Token",
    ],
    max_age=3600,
)
app.add_middleware(UserMiddleware)
app.add_middleware(TurnstileMiddleware)
app.add_middleware(
    AuthenticationMiddleware,
    backend=FirebaseAuthBackend(credential=CONFIG.firebase_credentials),
)

app.include_router(register_routes.router)
app.include_router(markdown_edit.router)
app.include_router(room.router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
