from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
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
    musicbrainz_artist_id = Column(Integer, ForeignKey("musicbrainz_artists.id"))
    is_music = Column(Boolean)

    musicbrainz_artist = relationship(
        "MusicBrainzArtist", back_populates="telegram_messages"
    )


class MusicBrainzArtist(Base):
    __tablename__ = "musicbrainz_artists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    mbid = Column(String, index=True)
    sort_name = Column(String, index=True)
    begin_area_name = Column(String)
    end_area_name = Column(String)
    country = Column(String)
    area_name = Column(String)
    area_sort_name = Column(String)
    life_span_ended = Column(Boolean)
    life_span_begin = Column(String)
    life_span_end = Column(String)
    type = Column(String)
    # TODO: track artist genre

    telegram_messages = relationship(
        "TelegramMessage", back_populates="musicbrainz_artist"
    )
