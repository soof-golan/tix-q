import contextlib
import os
import typing

import fastapi
from fastapi.middleware.cors import CORSMiddleware
import httpx

from prisma import Prisma, register
from .types import State
from .routes import register as register_routes


@contextlib.asynccontextmanager
async def lifespan(_app: fastapi.FastAPI) -> typing.AsyncIterator[State]:
    try:
        turnstile_secret = os.environ.get("TURNSTILE_SECRET", "secret")
        db = Prisma()
        register(db)
        await db.connect()
        async with httpx.AsyncClient() as client:
            yield {
                "http_client": client,
                "turnstile_secret": turnstile_secret,
                "db": db,
            }
    finally:
        await db.disconnect()


app = fastapi.FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["X-CSRF-Token"],
)

app.mount("/register", register_routes.app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
