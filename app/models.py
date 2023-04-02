from sqlalchemy import Boolean, Column, DateTime, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base

class TelegramSession(Base):
    """A Telegram session is a single instance of a Telegram client. Each session must be created
    by running the TelegramApi.py script directly.
    
    You will need to give permission to each session by feeding the received
    Telegram code back into the terminal prompt.
    
    This is necessary because Telethon does not allow multiple sessions to be active at the same time.
    See https://github.com/LonamiWebs/Telethon/issues/637#issuecomment-367974074 for more information."""
    __tablename__ = "telegram_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_name = Column(String, unique=True, index=True)
    in_use = Column(Boolean, default=False)
    last_used = Column(DateTime, default=None)

class TelegramMessage(Base):
    __tablename__ = "telegram_messages"
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, index=True) #unique=True)
    date = Column(DateTime)
    message = Column(String)
    is_webpage = Column(Boolean)
    webpage_url = Column(String)
    webpage_title = Column(String)
    webpage_description = Column(String)

    youtube_url = relationship("YoutubeUrl", back_populates="telegram_message")


class YoutubeUrl(Base):
    __tablename__ = "youtube_urls"
    id = Column(Integer, primary_key=True, index=True)
    telegram_message_id = Column(Integer, ForeignKey("telegram_messages.id"))
    url = Column(String, index=True)

    telegram_message = relationship("TelegramMessage", back_populates="youtube_url")
    youtube_metadata = relationship("YoutubeMetadata", back_populates="youtube_url")
    youtube_musicbrainz_artists = relationship("YoutubeUrlMusicBrainzArtist", back_populates="youtube_url")

class YoutubeMetadata(Base):
    __tablename__ = "youtube_metadata"
    id = Column(Integer, primary_key=True, index=True)
    youtube_url_id = Column(Integer, ForeignKey("youtube_urls.id"))
    title = Column(String, index=True)
    author_name = Column(String, index=True)
    author_url = Column(String)
    type = Column(String)
    height = Column(Integer)
    width = Column(Integer)
    version = Column(String)
    provider_name = Column(String)
    provider_url = Column(String)
    thumbnail_url = Column(String)
    thumbnail_width = Column(Integer)
    thumbnail_height = Column(Integer)
    html = Column(String)

    youtube_url = relationship("YoutubeUrl", back_populates="youtube_metadata")

class MusicBrainzArtist(Base):
    __tablename__ = "musicbrainz_artists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    mbid = Column(String, index=True)
    name = Column(String, index=True)
    sort_name = Column(String, index=True)
    begin_area = Column(String)
    end_area = Column(String)
    country = Column(String)
    area_name = Column(String)
    area_sort_name = Column(String)
    life_span_ended = Column(Boolean)
    life_span_begin = Column(Date)
    life_span_end = Column(Date)
    type = Column(String)

    musicbrainz_artist_genres = relationship("MusicBrainzArtistGenre", back_populates="musicbrainz_artist")
    youtube_musicbrainz_artists = relationship("YoutubeUrlMusicBrainzArtist", back_populates="musicbrainz_artist")

class MusicBrainzGenre(Base):
    __tablename__ = "musicbrainz_genres"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    musicbrainz_artist_genres = relationship("MusicBrainzArtistGenre", back_populates="musicbrainz_genre")

class MusicBrainzArtistGenre(Base):
    __tablename__ = "musicbrainz_artist_genres"
    id = Column(Integer, primary_key=True, index=True)
    musicbrainz_artist_id = Column(Integer, ForeignKey("musicbrainz_artists.id"))
    musicbrainz_genre_id = Column(Integer, ForeignKey("musicbrainz_genres.id"))

    musicbrainz_artist = relationship("MusicBrainzArtist", back_populates="musicbrainz_artist_genres")
    musicbrainz_genre = relationship("MusicBrainzGenre", back_populates="musicbrainz_artist_genres")


class YoutubeUrlMusicBrainzArtist(Base):
    __tablename__ = "youtube_url_musicbrainz_artists"
    id = Column(Integer, primary_key=True, index=True)
    youtube_url_id = Column(Integer, ForeignKey("youtube_urls.id"))
    musicbrainz_artist_id = Column(Integer, ForeignKey("musicbrainz_artists.id"))

    youtube_url = relationship("YoutubeUrl", back_populates="youtube_musicbrainz_artists")
    musicbrainz_artist = relationship("MusicBrainzArtist", back_populates="youtube_musicbrainz_artists")