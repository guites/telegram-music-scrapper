import os
import re
import spacy

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List, Union

from crud import TelegramCrud, TelegramSessionCrud
from definitions import SPACY_MODEL_PATH
from dependencies import get_db
from nlp import get_suggestions_from_telegram_messages
from schemas import (
    ArtistBase,
    TelegramMessageArtistCreate,
    TelegramMessageBase,
    TelegramMessageSchema,
    TelegramMessageWithSuggestions,
)
from TelegramApi import TelegramApi

router = APIRouter(
    prefix="/telegram_messages",
    tags=["telegram_messages"],
    responses={
        404: {"description": "Not found"},
        204: {"description": "Success with no content"},
    },
)


@router.get("/", response_model=List[TelegramMessageWithSuggestions])
async def read_telegram_messages(
    site_name: Union[str, None] = None,
    unlabeled: Union[bool, None] = None,
    suggestions: Union[bool, None] = None,
    db: Session = Depends(get_db),
):
    telegram_crud = TelegramCrud(db)

    try:
        telegram_messages = telegram_crud.read_telegram_messages(site_name, unlabeled)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if (
        suggestions is True
        and SPACY_MODEL_PATH is not None
        and os.path.exists(SPACY_MODEL_PATH)
    ):
        nlp_ner = spacy.load(SPACY_MODEL_PATH)
        telegram_messages_with_suggestions = get_suggestions_from_telegram_messages(
            nlp_ner, telegram_messages
        )
        return telegram_messages_with_suggestions

    return telegram_messages


@router.get("/artists")
def get_all_messages_with_artists(db: Session = Depends(get_db)):
    telegram_crud = TelegramCrud(db)
    message_artists = telegram_crud.read_telegram_messages_with_artists()

    response_data = []

    for message_artist in message_artists:
        # find every index of artist name in text
        text = message_artist[0].telegram_message.webpage_title
        artists = message_artist.artist_names.split(",")

        spans = []
        for artist in artists:
            matches = re.finditer(artist, text)
            artist_spans = []
            for match in matches:
                match_start = match.start()
                artist_spans.append((match_start, match_start + len(artist), "artist"))
            spans = spans + artist_spans
        element = {
            "text": text,
            "entities": spans,
            "artists": artists,
            "telegram_message_id": message_artist[0].telegram_message.id,
        }
        response_data.append(element)

    return {"count": len(response_data), "dataset": response_data}


@router.post("/suggestions", response_model=List[TelegramMessageWithSuggestions])
async def get_spacy_nlp_suggestions(
    telegram_message_ids: List[int],
    db: Session = Depends(get_db),
):
    # get the messages from the database
    telegram_crud = TelegramCrud(db)
    telegram_messages = telegram_crud.read_telegram_messages_by_ids(
        telegram_message_ids
    )

    # load the spacy model
    if SPACY_MODEL_PATH is None or not os.path.exists(SPACY_MODEL_PATH):
        raise HTTPException(
            status_code=500, detail="No available spaCy model was found."
        )
    nlp_ner = spacy.load(SPACY_MODEL_PATH)
    telegram_messages_with_suggestions = get_suggestions_from_telegram_messages(
        nlp_ner, telegram_messages
    )
    return telegram_messages_with_suggestions


@router.get("/{telegram_message_id}")
async def read_telegram_message(
    telegram_message_id: int, db: Session = Depends(get_db)
) -> TelegramMessageBase:
    telegram_crud = TelegramCrud(db)
    telegram_message = telegram_crud.read_telegram_message(telegram_message_id)
    if telegram_message is None:
        raise HTTPException(status_code=404, detail="Telegram message not found")
    return telegram_message


@router.get("/site_names")
async def read_telegram_message_site_names(db: Session = Depends(get_db)):
    telegram_crud = TelegramCrud(db)
    telegram_message_site_names = telegram_crud.read_telegram_message_site_names()
    return telegram_message_site_names


@router.post("/sync")
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
        raise HTTPException(
            status_code=500, detail="Error while connecting to the telegram api."
        )

    # get messages older than the starting offset
    telegram_api.set_message_offset(starting_offset_id)

    messages = await telegram_api._run_get_messages_routine()

    # save messages to database
    saved_messages = telegram_crud.save_batch_telegram_messages(messages[0])

    # close the session
    telegram_api.client.disconnect()
    telegram_session_crud.set_telegram_session_unused(unused_session.id)

    return saved_messages


@router.post(
    "/{telegram_message_id}/artist", status_code=201, response_model=ArtistBase
)
def register_artist_to_telegram_message(
    telegram_message_id: int,
    artist: TelegramMessageArtistCreate,
    db: Session = Depends(get_db),
):
    telegram_crud = TelegramCrud(db)
    try:
        telegram_message_artist = telegram_crud.register_artist_to_telegram_message(
            telegram_message_id, artist.artist_name
        )
    except IntegrityError as e:
        print(str(e))
        raise HTTPException(
            status_code=400, detail="Artist already registered to telegram message."
        )
    return telegram_message_artist


@router.delete("/{telegram_message_id}/artist/{artist_id}", status_code=204)
def unregister_artist_from_telegram_message(
    telegram_message_id: int, artist_id: int, db: Session = Depends(get_db)
):
    telegram_crud = TelegramCrud(db)
    unregistered_artist = telegram_crud.unregister_artist_from_telegram_message(
        telegram_message_id, artist_id
    )
    if unregistered_artist is None:
        raise HTTPException(
            status_code=400, detail="Artist not registered to telegram message."
        )
