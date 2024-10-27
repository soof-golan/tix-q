"""

!!! Beware !!!

This schema might drift from the actual database schema. This
was manually written to be used by the ORM. The actual schema is
controlled by the Prisma schema file in prisma/schema.prisma

"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import List

import sqlalchemy
from sqlalchemy import ForeignKey, types
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship


class IdType(enum.Enum):
    ID_CARD = "ID_CARD"
    PASSPORT = "PASSPORT"


class Base(DeclarativeBase):
    type_annotation_map = {
        IdType: sqlalchemy.Enum(IdType, name="IdType"),
    }


class Registrant(Base):
    __tablename__ = "Registrant"
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=sqlalchemy.text("gen_random_uuid()"),
    )
    created_at: Mapped[datetime] = mapped_column(
        server_default=sqlalchemy.sql.func.now(),
        name="createdAt",
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=sqlalchemy.sql.func.now(),
        onupdate=sqlalchemy.sql.func.now(),
        default=sqlalchemy.sql.func.now(),
        name="updatedAt",
        nullable=False,
    )

    legal_name: Mapped[str] = mapped_column(nullable=False, name="legalName")
    email: Mapped[str] = mapped_column(nullable=False)
    id_number: Mapped[str] = mapped_column(nullable=False, name="idNumber")
    id_type: Mapped[IdType] = mapped_column(nullable=False, name="idType")
    phone_number: Mapped[str] = mapped_column(nullable=False, name="phoneNumber")
    event_choice: Mapped[str] = mapped_column(nullable=False, name="eventChoice")

    turnstile_success: Mapped[bool] = mapped_column(
        nullable=False,
        name="turnstileSuccess",
        default=False,
    )
    turnstile_timestamp: Mapped[datetime] = mapped_column(
        types.DateTime(timezone=True),
        nullable=True,
        name="turnstileTimestamp",
    )
    turnstile_fail_reason: Mapped[str | None] = mapped_column(
        nullable=True,
        name="turnstileFailReason",
    )

    waiting_room_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("WaitingRoom.id"),
        nullable=False,
        name="waitingRoomId",
    )
    waiting_room: Mapped[WaitingRoom] = relationship(back_populates="registrants")


class WaitingRoom(Base):
    __tablename__ = "WaitingRoom"
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=sqlalchemy.text("gen_random_uuid()"),
    )
    created_at: Mapped[datetime] = mapped_column(
        server_default=sqlalchemy.sql.func.now(),
        name="createdAt",
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=sqlalchemy.sql.func.now(),
        onupdate=sqlalchemy.sql.func.now(),
        default=sqlalchemy.sql.func.now(),
        name="updatedAt",
        nullable=False,
    )

    opens_at: Mapped[datetime] = mapped_column(
        types.DateTime(timezone=True),
        nullable=False,
        name="opensAt",
    )
    closes_at: Mapped[datetime] = mapped_column(
        types.DateTime(timezone=True),
        nullable=False,
        name="closesAt",
    )
    published: Mapped[bool] = mapped_column(nullable=False, default=False)

    markdown: Mapped[str] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(nullable=False)
    event_choices: Mapped[str] = mapped_column(nullable=False, name="eventChoices")
    desktop_image_blob: Mapped[str | None] = mapped_column(
        nullable=True,
        name="desktopImageBlob",
    )
    mobile_image_blob: Mapped[str | None] = mapped_column(
        nullable=True,
        name="mobileImageBlob",
    )

    registrants: Mapped[List[Registrant]] = relationship(back_populates="waiting_room")

    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("User.id"),
        nullable=False,
        name="ownerId",
    )
    owner: Mapped[User] = relationship(back_populates="waiting_rooms")


class User(Base):
    __tablename__ = "User"
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=sqlalchemy.text("gen_random_uuid()"),
    )
    created_at: Mapped[datetime] = mapped_column(
        server_default=sqlalchemy.sql.func.now(),
        name="createdAt",
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=sqlalchemy.sql.func.now(),
        onupdate=sqlalchemy.sql.func.now(),
        default=sqlalchemy.sql.func.now(),
        name="updatedAt",
        nullable=False,
    )

    firebase_uid: Mapped[str] = mapped_column(
        nullable=False,
        name="firebaseUid",
        unique=True,
    )
    email: Mapped[str] = mapped_column(nullable=False)

    waiting_rooms: Mapped[List[WaitingRoom]] = relationship(back_populates="owner")
