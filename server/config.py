import os

from pydantic import BaseModel


class Config(BaseModel):
    """
    Configuration for the backend
    """

    firebase_credentials: str = os.environ.get("FIREBASE_CREDENTIALS", "firebase_credentials.json")
    """
    The path to the Firebase credentials file OR the contents of the file in JSON format
    """

    turnstile_secret: str = os.environ.get("TURNSTILE_SECRET", "change_me")
    """
    The secret used to validate turnstile requests
    """


CONFIG = Config()
