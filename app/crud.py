from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models import TelegramMessage

class TelegramCrud:
    def save_batch_telegram_messages(self, messages, db: Session):
        formatted_messages = []
        for message in messages:
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
            db.bulk_save_objects(formatted_messages)
        except IntegrityError as e:
            print("IntegrityError:", e)
        db.commit()
        return formatted_messages

    def get_earliest_telegram_message(self, db: Session):
        earliest_message = db.query(TelegramMessage).order_by(TelegramMessage.telegram_id).first()
        if earliest_message is None:
            return 0
        return earliest_message.telegram_id