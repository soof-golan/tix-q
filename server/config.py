import os

from pydantic import BaseModel


class Config(BaseModel):
    """
    Configuration for the backend
    """

    firebase_credentials: str = os.environ.get("FIREBASE_CREDENTIALS")
    """
    The path to the Firebase credentials file OR the contents of the file in JSON format
    """

    turnstile_secret: str = os.environ.get("TURNSTILE_SECRET", "change_me")
    """
    The secret used to validate turnstile requests
    """

    deploy_hook_url: str = os.environ.get("DEPLOY_HOOK_URL", "")

    production: bool = os.environ.get("PRODUCTION", "true").lower() == "true"


CONFIG = Config()
