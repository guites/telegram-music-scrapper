import uvicorn

from fastapi import Depends, HTTPException, FastAPI
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


@app.get("/telegram_messages")
async def read_telegram_messages(db: Session = Depends(get_db)):
    telegram_messages = db.query(models.TelegramMessage).all()
    return telegram_messages

@app.post("/telegram_messages/sync")
async def sync_telegram_messages(db: Session = Depends(get_db)):
    """Fetches telegram messages from the telegram api to the database."""
    telegram_crud = TelegramCrud(db)

    # check if there are any unused sessions
    unused_session = telegram_crud.get_unused_telegram_session()
    if unused_session is None:
        raise HTTPException(status_code=503, detail="All telethon sessions are in use.", headers={"Retry-After": "60"})
    
    telegram_crud.set_telegram_session_in_use(unused_session.id)
    print(f"Using session: {unused_session.session_name}")

    # get the earliest message id as a starting point for this batch
    starting_offset_id = telegram_crud.get_earliest_telegram_message()
    print(f"Starting offset id: {starting_offset_id}")

    telegram_api = TelegramApi(unused_session.session_name)

    # get messages older than the starting offset
    telegram_api.set_message_offset(starting_offset_id)

    messages = await telegram_api._run_get_messages_routine()

    # save messages to database
    saved_messages = telegram_crud.save_batch_telegram_messages(messages[0])

    # close the session
    telegram_api.client.disconnect()
    telegram_crud.set_telegram_session_unused(unused_session.id)

    return saved_messages



def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
