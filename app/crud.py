from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models import TelegramMessage, TelegramSession

class TelegramCrud:
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
        return self.db.query(TelegramSession).filter(TelegramSession.in_use == False).first()
    
    def set_telegram_session_in_use(self, session_id):
        session = self.db.query(TelegramSession).filter(TelegramSession.id == session_id).first()
        session.in_use = True
        session.last_used = datetime.now()
        self.db.commit()
        return session
    
    def set_telegram_session_unused(self, session_id):
        session = self.db.query(TelegramSession).filter(TelegramSession.id == session_id).first()
        session.in_use = False
        self.db.commit()
        return session
    
    def get_telegram_session_by_name(self, session_name):
        return self.db.query(TelegramSession).filter(TelegramSession.session_name == session_name).first()

    def save_batch_telegram_messages(self, messages):
        formatted_messages = []
        for message in messages:
            if not 'message' in message:
                continue

            formatted_message = {
                "telegram_id": message['id'],
                "date": message['date'],
                "message": message['message'],
            }
            if 'media' in message and message['media'] is not None:
                if 'webpage' in message['media'] and message['media']['webpage'] is not None:
                    formatted_message['is_webpage'] = True
                    formatted_message['webpage_url'] = message['media']['webpage']['url'] if 'url' in message['media']['webpage'] else None
                    formatted_message['webpage_title'] = message['media']['webpage']['title'] if 'title' in message['media']['webpage'] else None
                    formatted_message['webpage_description'] = message['media']['webpage']['description'] if 'description' in message['media']['webpage'] else None
            formatted_messages.append(TelegramMessage(**formatted_message))

        try:
            self.db.bulk_save_objects(formatted_messages)
        except IntegrityError as e:
            print("IntegrityError:", e)
            self.db.rollback()
        self.db.commit()
        print("Saved messages to database")
        return formatted_messages

    def get_earliest_telegram_message(self):
        earliest_message = self.db.query(TelegramMessage).order_by(TelegramMessage.telegram_id).first()
        self.db.commit()
        if earliest_message is None:
            return 0
        return earliest_message.telegram_id