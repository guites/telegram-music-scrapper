import os
import time
import uvicorn

from dask import dataframe as dd
from fastapi import Depends, HTTPException, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Union

import models

from crud import MusicBrainzArtistCrud, TelegramCrud, TelegramSessionCrud
from database import SessionLocal, engine
from RapidFuzz import RapidFuzz
from schemas import TelegramMessageResponse
from TelegramApi import TelegramApi

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


# TODO: this information is available on the musicbrainz_artist table
ARTISTS_LIST = dd.read_csv(
    os.path.join(
        "/Users/guilhermegarcia/Projects/matehackers-telegram/app/scripts/artist_importer/artist_names.txt"
    ),
    sep=";",
)["artist"]
ARTISTS_FUZZ = RapidFuzz(ARTISTS_LIST)


@app.get("/musicbrainz_artists/search")
async def fuzzy_search_artist(name: str):
    return ARTISTS_FUZZ.extract_single(name, 5)


@app.get("/musicbrainz_artists/{artist_id}")
def read_artist(artist_id: int, db: Session = Depends(get_db)):
    artist_crud = MusicBrainzArtistCrud(db)
    artist = artist_crud.get_artist(artist_id)
    if artist is None:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist


@app.post("/telegram_messages/{telegram_message_id}/bind/{musicbrainz_artist_id}")
async def bind_telegram_message_to_musicbrainz_artist(
    telegram_message_id: int, musicbrainz_artist_id: int, db: Session = Depends(get_db)
):
    telegram_crud = TelegramCrud(db)

    telegram_message = telegram_crud.bind_telegram_message_to_musicbrainz_artist(
        telegram_message_id, musicbrainz_artist_id
    )
    return telegram_message


@app.get("/telegram_messages/site_names")
async def read_telegram_message_site_names(db: Session = Depends(get_db)):
    telegram_crud = TelegramCrud(db)
    telegram_message_site_names = telegram_crud.read_telegram_message_site_names()
    return telegram_message_site_names


@app.get("/telegram_messages")
async def read_telegram_messages(
    site_name: Union[str, None] = None,
    has_musicbrainz_artist: bool = False,
    is_music: bool = True,
    fields: List[str] = Query(None),
    db: Session = Depends(get_db),
):
    telegram_crud = TelegramCrud(db)
    try:
        telegram_messages = telegram_crud.read_telegram_messages(
            site_name, has_musicbrainz_artist, is_music, fields
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

    telegram_api = TelegramApi(unused_session.session_name)

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


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
