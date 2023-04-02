import asyncio
import uvicorn

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

import models

from crud import TelegramCrud
from database import SessionLocal, engine
from TelegramApi import TelegramApi

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class DatabaseWrapper:
    def __init__(self):
        self.db = SessionLocal()

    def __enter__(self):
        return self.db

    def __exit__(self, exc_type, exc_value, traceback):
        self.db.close()


@app.get("/telegram_messages")
async def read_telegram_messages(db: Session = Depends(get_db)):
    telegram_messages = db.query(models.TelegramMessage).all()
    return telegram_messages

@app.post("/telegram_messages/sync")
async def sync_telegram_messages():
    telegram_crud = TelegramCrud()

    # get the earliest message id as a starting point for this batch
    with DatabaseWrapper() as db:
        starting_offset_id = telegram_crud.get_earliest_telegram_message(db)
    print(f"Starting offset id: {starting_offset_id}")

    telegram_api = TelegramApi()
    # get messages older than the starting offset
    telegram_api.set_message_offset(starting_offset_id)
    messages = await asyncio.gather(telegram_api._run_get_messages_routine())
    
    # save messages to database
    with DatabaseWrapper() as db:
        telegram_crud.save_batch_telegram_messages(messages[0], db)


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
