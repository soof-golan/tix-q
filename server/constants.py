"""
Constants used throughout the application.
"""

# A 'nice' response to send to users who are trying to hack the system.
# This is mainly used to deter humans that know how to open the dev console from
# trying to register multiple times / multiple people.
PLAY_NICE_RESPONSE = """
Hey {name}!,
I know going to this event is important to you, but please don't hack me.
I'm running this as a free service for the community, and I'm doing my best to make sure everyone gets a fair chance.
If you think this is a mistake, please contact me.
If you're running a bot, please stop.
Toodles ❤️
Soof
"""

TTL_FIVE_MINUTES = 60 * 5

DEV_CORS_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:3000",
]

PROD_CORS_ORIGINS = [
    "https://waitingroom.soofgolan.com",
    "https://tix-q-api.soofgolan.com",
]
log_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": "%(levelprefix)s %(asctime)s %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        },
    },
    "loggers": {
        "tix-q": {"handlers": ["default"], "level": "INFO"},
    },
}
