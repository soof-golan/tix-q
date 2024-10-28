import contextlib
import typing
from contextlib import AsyncExitStack
from logging.config import dictConfig

import fastapi
import httpx
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import (
    async_sessionmaker,
    AsyncEngine,
    create_async_engine,
)
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.middleware.gzip import GZipMiddleware
from timing_asgi import TimingClient, TimingMiddleware
from timing_asgi.integrations import StarletteScopeToName
import sentry_sdk

from .config import CONFIG
from .constants import DEV_CORS_ORIGINS, log_config, PROD_CORS_ORIGINS
from .logger import logger
from .middleware.firebase import FirebaseAuthBackend
from .middleware.turnstile import TurnstileMiddleware
from .routes import markdown_edit
from .routes import register as register_routes
from .routes import room
from .types import State

dictConfig(log_config)

sentry_sdk.init(
    dsn=CONFIG.sentry_dsn,
    environment=CONFIG.environment,
)


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
    exit_stack = AsyncExitStack()
    logger.info("Starting application")
    logger.info("Config: %s", CONFIG)

    engine = create_async_engine(
        CONFIG.sqlalchemy_database_url
        and CONFIG.sqlalchemy_database_url.get_secret_value(),
        echo=not CONFIG.production,
        hide_parameters=CONFIG.production,
        pool_size=30,
        max_overflow=70,
    )
    exit_stack.push_async_callback(engine.dispose)
    session_maker = async_sessionmaker(engine)

    async with exit_stack:
        gh_http_client = await exit_stack.enter_async_context(
            httpx.AsyncClient(base_url="https://api.github.com")
        )
        cf_http_client = await exit_stack.enter_async_context(
            httpx.AsyncClient(base_url="https://challenges.cloudflare.com")
        )
        await db_connection_check(engine)
        yield {
            "gh_http_client": gh_http_client,
            "cf_http_client": cf_http_client,
            "db": session_maker,
        }


async def db_connection_check(engine: AsyncEngine) -> None:
    """
    Check that we can connect to the database
    """
    logger.info("db_connection_check: Connecting to database")
    async with engine.connect() as connection:
        connection_check = (await connection.execute(select(1))).scalar_one()
        logger.info("db_connection_check: select %s", connection_check)


class TimingLogger(TimingClient):
    def timing(self, metric_name, timing, tags):
        logger.info("%s %s %s", metric_name, timing, tags)


app = fastapi.FastAPI(lifespan=lifespan)
if not CONFIG.production:
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
app.add_middleware(TurnstileMiddleware)
app.add_middleware(
    AuthenticationMiddleware,
    backend=FirebaseAuthBackend(
        credential=CONFIG.firebase_credentials
        and CONFIG.firebase_credentials.get_secret_value()
    ),
)

app.include_router(register_routes.router)
app.include_router(markdown_edit.router)
app.include_router(room.router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
