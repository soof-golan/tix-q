import asyncio
import logging

import os
import socket
from urllib.parse import urlparse

handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(handler)


def get_db_url():
    """
    Get the database URL from the environment
    The url is in the format:
    postgres://<username>:<password>@<host>:<port>/<database>
    """
    db_url = os.environ.get("DATABASE_URL")
    if db_url is None:
        raise ValueError("DATABASE_URL environment variable not set")
    return db_url


def establish_tcp_connection(url: str):
    logger.info(url)
    u = urlparse(url)
    logger.info(u)
    addr = socket.gethostbyname(u.hostname)
    sck = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sck.settimeout(5)
    try:
        logger.info("[%s] Connecting to database", establish_tcp_connection.__name__)
        sck.connect((addr, u.port))
        logger.info("[%s] Connected to database", establish_tcp_connection.__name__)
    except socket.error as e:
        logger.exception(
            "[%s] Unable to connect to database", establish_tcp_connection.__name__, e
        )
        raise
    finally:
        logger.info("[%s] Closing socket", establish_tcp_connection.__name__)
        sck.close()
        logger.info("[%s] Closed socket", establish_tcp_connection.__name__)


async def main():
    url = get_db_url()
    for attempt in range(5):
        try:
            establish_tcp_connection(url)
        except Exception as e:
            logger.exception("[%s][attempt:%s] Unable to connect to database", main.__name__, attempt, e)
        else:
            logger.info("[%s][attempt:%s] Successfully connected to database", main.__name__, attempt)
            break
        await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(main())
