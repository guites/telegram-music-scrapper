from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import relationship

from database import Base


class TelegramSession(Base):
    """A Telegram session is a single instance of a Telegram client. Each session must be created
    by running the TelegramApi.py script directly.

    You will need to give permission to each session by feeding the received
    Telegram code back into the terminal prompt.

    This is necessary because Telethon does not allow multiple sessions to be active at the same time.
    See https://github.com/LonamiWebs/Telethon/issues/637#issuecomment-367974074 for more information.
    """

    __tablename__ = "telegram_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_name = Column(String, unique=True, index=True)
    in_use = Column(Boolean, default=False)
    last_used = Column(DateTime, default=None)


class TelegramMessageArtist(Base):
    __tablename__ = "telegram_message_artists"
    id = Column(Integer, primary_key=True, index=True)
    telegram_message_id = Column(Integer, ForeignKey("telegram_messages.id"))
    artist_id = Column(Integer, ForeignKey("artists.id"))
    telegram_message = relationship("TelegramMessage", back_populates="artist_associations")
    artist = relationship("Artist", back_populates="telegram_message_associations")
    UniqueConstraint(telegram_message_id, artist_id)


class TelegramMessage(Base):
    __tablename__ = "telegram_messages"
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, index=True, unique=True)
    date = Column(String)
    message = Column(String)
    is_webpage = Column(Boolean)
    site_name = Column(String)
    webpage_url = Column(String)
    webpage_title = Column(String)
    webpage_description = Column(String)
    is_music = Column(Boolean)

    artist_associations = relationship(
        "TelegramMessageArtist", back_populates="telegram_message"
    )

    artists = association_proxy(
        "artist_associations",
        "artist",
        creator=lambda artist_obj: TelegramMessageArtist(artist=artist_obj),
    )


class Artist(Base):
    __tablename__ = "artists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    longitude = Column(String)
    latitude = Column(String)
    telegram_message_associations = relationship(
        "TelegramMessageArtist", back_populates="artist"
    )

    telegram_messages = association_proxy(
        "telegram_message_associations",
        "telegram_message",
        creator=lambda telegram_message_obj: TelegramMessageArtist(
            telegram_message=telegram_message_obj
        ),
    )

