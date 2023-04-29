import os
import re
import time
import uvicorn

from fastapi import Depends, HTTPException, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List, Union
from unidecode import unidecode

import models

from crud import TelegramCrud, TelegramSessionCrud
from database import SessionLocal, engine
from RapidFuzz import RapidFuzz
from schemas import TelegramMessageResponse, TelegramMessageArtistCreate, TelegramMessageArtistResponse
from TelegramApi import TelegramApi
from utils import check_artist_names_file

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/telegram_messages/{telegram_message_id}/artist", status_code=201, response_model=TelegramMessageArtistResponse)
def register_artist_to_telegram_message(
    telegram_message_id: int, artist: TelegramMessageArtistCreate, db: Session = Depends(get_db)
):
    telegram_crud = TelegramCrud(db)
    try:
        telegram_message_artist = telegram_crud.register_artist_to_telegram_message(
            telegram_message_id, artist.artist_name
        )
    except IntegrityError as e:
        print(str(e))
        raise HTTPException(status_code=400, detail="Artist already registered to telegram message.")
    return telegram_message_artist


@app.get("/telegram_messages/site_names")
async def read_telegram_message_site_names(db: Session = Depends(get_db)):
    telegram_crud = TelegramCrud(db)
    telegram_message_site_names = telegram_crud.read_telegram_message_site_names()
    return telegram_message_site_names


@app.get("/telegram_messages", response_model=List[TelegramMessageResponse])
async def read_telegram_messages(
    site_name: Union[str, None] = None,
    is_music: Union[bool, None] = None,
    fields: List[str] = Query(None),
    offset_id: Union[int, None] = None,
    db: Session = Depends(get_db),
):
    telegram_crud = TelegramCrud(db)
    try:
        telegram_messages = telegram_crud.read_telegram_messages(
            site_name, is_music, offset_id, fields
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return telegram_messages


@app.get("/telegram_messages/{telegram_message_id}")
async def read_telegram_message(
    telegram_message_id: int, db: Session = Depends(get_db)
) -> TelegramMessageResponse:
    telegram_crud = TelegramCrud(db)
    telegram_message = telegram_crud.read_telegram_message(telegram_message_id)
    if telegram_message is None:
        raise HTTPException(status_code=404, detail="Telegram message not found")
    return telegram_message


@app.post("/telegram_messages/sync")
async def sync_telegram_messages(db: Session = Depends(get_db)):
    """Fetches telegram messages from the telegram api to the database."""
    telegram_session_crud = TelegramSessionCrud(db)
    telegram_crud = TelegramCrud(db)

    # check if there are any unused sessions
    unused_session = telegram_session_crud.get_unused_telegram_session()
    if unused_session is None:
        raise HTTPException(
            status_code=503,
            detail="All telethon sessions are in use.",
            headers={"Retry-After": "60"},
        )

    telegram_session_crud.set_telegram_session_in_use(unused_session.id)
    print(f"Using session: {unused_session.session_name}")

    # get the earliest message id as a starting point for this batch
    starting_offset_id = telegram_crud.get_earliest_telegram_message_id()
    print(f"Starting offset id: {starting_offset_id}")

    try:
        telegram_api = TelegramApi(unused_session.session_name)
    except ValueError as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error while connecting to the telegram api.")
    
    # get messages older than the starting offset
    telegram_api.set_message_offset(starting_offset_id)

    messages = await telegram_api._run_get_messages_routine()

    # save messages to database
    saved_messages = telegram_crud.save_batch_telegram_messages(messages[0])

    # close the session
    telegram_api.client.disconnect()
    telegram_session_crud.set_telegram_session_unused(unused_session.id)

    return saved_messages


@app.patch("/telegram_messages/{telegram_message_id}")
async def update_telegram_message_is_music(
    telegram_message_id: int,
    is_music: bool,
    db: Session = Depends(get_db),
):
    telegram_crud = TelegramCrud(db)
    telegram_message = telegram_crud.update_telegram_message_is_music(
        telegram_message_id, is_music
    )
    if telegram_message is None:
        raise HTTPException(status_code=404, detail="Telegram message not found")
    return telegram_message

@app.get("/spacy/dataset")
def generate_spacy_dataset(
    db: Session = Depends(get_db),
):
    telegram_crud = TelegramCrud(db)
    telegram_messages = telegram_crud.read_telegram_messages(
        is_music=True
    )
    dataset = []
    for msg in telegram_messages:
        artists = msg.telegram_message_artists
        if len(artists) == 0:
            continue

        webpage_title = msg.webpage_title
        webpage_description = msg.webpage_description

        # concatenate title and description, if description is not null
        if webpage_description is not None:
            text = webpage_title + " " + webpage_description
        else:
            text = webpage_title

        # remove accents and convert to lowercase
        cleaned_text = unidecode(text.lower().strip())
        cleaned_text = cleaned_text.replace("\n", " ")

        cleaned_artists = [unidecode(artist.artist_name.lower().strip()) for artist in artists]

        spans = []
        for cleaned_artist in cleaned_artists:
            # find every index of artist name in text
            artist_indices = [m.start() for m in re.finditer(cleaned_artist, cleaned_text)]
            # create a list of tuples with the start and end index of the artist name
            artist_spans = [(i, i + len(cleaned_artist), "artist") for i in artist_indices]
            spans = spans + artist_spans

        element = {
            "text": cleaned_text,
            "entities": spans,
            "artists": cleaned_artists,
            "telegram_message_id": msg.id,
        }
        dataset.append(element)

    return {
        "count": len(dataset),
        "dataset": dataset,
    }


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
