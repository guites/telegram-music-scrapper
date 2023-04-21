import sqlalchemy as sa

from datetime import datetime
from sqlalchemy import inspect
from sqlalchemy.orm import load_only, Session
from typing import List, Union

from models import (
    MusicBrainzArtist,
    TelegramMessage,
    TelegramMessageArtist,
    TelegramSession,
)


class MusicBrainzArtistCrud:
    def __init__(self, db: Session):
        self.db = db

    def get_artists(self):
        return self.db.query(MusicBrainzArtist).all()

    def get_artist(self, artist_id):
        return (
            self.db.query(MusicBrainzArtist)
            .filter(MusicBrainzArtist.id == artist_id)
            .first()
        )


class TelegramSessionCrud:
    def __init__(self, db: Session):
        self.db = db

    def save_telegram_session(self, session_name):
        telegram_session = TelegramSession(
            session_name=session_name,
        )
        self.db.add(telegram_session)
        self.db.commit()
        return telegram_session

    def get_unused_telegram_session(self):
        return (
            self.db.query(TelegramSession)
            .filter(TelegramSession.in_use == False)
            .first()
        )

    def set_telegram_session_in_use(self, session_id):
        session = (
            self.db.query(TelegramSession)
            .filter(TelegramSession.id == session_id)
            .first()
        )
        session.in_use = True
        session.last_used = datetime.now()
        self.db.commit()
        return session

    def set_telegram_session_unused(self, session_id):
        session = (
            self.db.query(TelegramSession)
            .filter(TelegramSession.id == session_id)
            .first()
        )
        session.in_use = False
        self.db.commit()
        return session

    def get_telegram_session_by_name(self, session_name):
        return (
            self.db.query(TelegramSession)
            .filter(TelegramSession.session_name == session_name)
            .first()
        )


class TelegramCrud:
    def __init__(self, db: Session):
        self.db = db

    def read_telegram_message(self, telegram_message_id):
        return (
            self.db.query(TelegramMessage)
            .filter(TelegramMessage.id == telegram_message_id)
            .first()
        )

    def read_telegram_messages(
        self,
        site_name: Union[str, None] = None,
        is_music: Union[bool, None] = None,
        offset_id: Union[int, None] = None,
        fields: Union[List[str], None] = None,
    ):
        query = self.db.query(TelegramMessage)
        # allow user to select which fields to return
        if fields is not None:
            field_mapper = inspect(TelegramMessage)
            allowed_fields = [column.key for column in field_mapper.attrs]
            for field in fields:
                if field not in allowed_fields:
                    raise ValueError(f"Field {field} is not allowed.")
            # load only columns received in fields param in the form of ORM mapped attributes
            query = query.options(
                load_only(*[getattr(TelegramMessage, f) for f in fields])
            )

        if site_name is not None:
            query = query.filter(TelegramMessage.site_name == site_name)
        
        if is_music is not None:
            query = query.filter(TelegramMessage.is_music == is_music)
        else:
            query = query.filter(TelegramMessage.is_music == None)
        
        if offset_id is not None:
            query = query.filter(TelegramMessage.id > offset_id)

        return query.all()

    def read_telegram_message_site_names(self):
        site_names = self.db.query(TelegramMessage.site_name).distinct().all()
        return [site_name[0] for site_name in site_names]

    def save_batch_telegram_messages(self, messages):
        formatted_messages = []
        for message in messages:
            if not "message" in message:
                continue

            formatted_message = {
                "telegram_id": message["id"],
                "date": message["date"],
                "message": message["message"],
            }
            if "media" in message and message["media"] is not None:
                if (
                    "webpage" in message["media"]
                    and message["media"]["webpage"] is not None
                ):
                    formatted_message["is_webpage"] = True
                    formatted_message["site_name"] = (
                        message["media"]["webpage"]["site_name"]
                        if "site_name" in message["media"]["webpage"]
                        else None
                    )
                    formatted_message["webpage_url"] = (
                        message["media"]["webpage"]["url"]
                        if "url" in message["media"]["webpage"]
                        else None
                    )
                    formatted_message["webpage_title"] = (
                        message["media"]["webpage"]["title"]
                        if "title" in message["media"]["webpage"]
                        else None
                    )
                    formatted_message["webpage_description"] = (
                        message["media"]["webpage"]["description"]
                        if "description" in message["media"]["webpage"]
                        else None
                    )
            formatted_messages.append(TelegramMessage(**formatted_message))

        self.db.bulk_save_objects(formatted_messages)

        self.db.commit()
        print("Saved messages to database")
        return formatted_messages

    def get_earliest_telegram_message_id(self):
        earliest_message = (
            self.db.query(TelegramMessage).order_by(TelegramMessage.telegram_id).first()
        )
        self.db.commit()
        if earliest_message is None:
            return 0
        return earliest_message.telegram_id

    def bind_telegram_message_to_musicbrainz_artist(
        self, message_id, musicbrainz_artist_id
    ):
        telegram_message = self.read_telegram_message(message_id)
        telegram_message.musicbrainz_artist_id = musicbrainz_artist_id
        self.db.add(telegram_message)
        self.db.commit()
        return telegram_message

    def register_artist_to_telegram_message(self, message_id, artist_name):
        telegram_message = self.read_telegram_message(message_id)
        telegram_message_artist = TelegramMessageArtist(
            telegram_message_id=telegram_message.id, artist_name=artist_name
        )
        self.db.add(telegram_message_artist)
        self.db.commit()
        return telegram_message_artist

    def update_telegram_message_is_music(self, message_id, is_music):
        telegram_message = self.read_telegram_message(message_id)
        if telegram_message is None:
            return None
        telegram_message.is_music = is_music
        self.db.add(telegram_message)
        self.db.commit()
        return telegram_message
