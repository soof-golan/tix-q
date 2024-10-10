import os

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings


class Config(BaseSettings):
    """
    Configuration for the backend
    """

    firebase_credentials: SecretStr | None = Field(os.environ.get("FIREBASE_CREDENTIALS"))
    """
    The path to the Firebase credentials file OR the contents of the file in JSON format
    """

    turnstile_secret: SecretStr | None = Field(os.environ.get("TURNSTILE_SECRET", "change_me"))
    """
    The secret used to validate turnstile requests
    """

    github_token: SecretStr | None = Field(os.environ.get("GITHUB_TOKEN"))
    """
    The GitHub API key used to create deployments
    """

    github_repo: str = Field(os.environ.get("GITHUB_REPO", "soof-golan/tix-q"))
    """
    The GitHub repo to deploy
    """

    github_workflow_id: str = Field(os.environ.get("GITHUB_WORKFLOW_ID", "publish_website.yml"))
    """
    The GitHub repo to deploy
    """

    production: bool = Field(os.environ.get("PRODUCTION", "true").lower() == "true")
    """
    Whether or not the server is running in production mode (affects CORS origins and deployment triggers)
    """

    database_url: SecretStr | None = Field(os.environ.get("SQLALCHEMY_DATABASE_URL"))
    """
    The URL to the database (cockroachdb)
    """

    sentry_dsn: str | None = os.environ.get("SENTRY_DSN")


CONFIG = Config()
