import os
import re
import spacy
import time
import uvicorn

from fastapi import Depends, HTTPException, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from unidecode import unidecode

import app.models as models

from app.crud import ArtistCrud, TelegramCrud
from app.database import engine
from app.definitions import SPACY_MODEL_PATH
from app.dependencies import get_db
from app.routers import artists, telegram_messages
from app.MusicBrainz import MusicBrainz

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.include_router(telegram_messages.router)
app.include_router(artists.router)

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
        artists = msg.artists
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

        cleaned_artists = [unidecode(artist.name.lower().strip()) for artist in artists]

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


@app.get("/spacy/inference")
def spacy_inference(
    video_title: str,
    video_description: str = None,
    db: Session = Depends(get_db),
):
    # load the spacy model
    if SPACY_MODEL_PATH is None or not os.path.exists(SPACY_MODEL_PATH):
        raise HTTPException(status_code=500, detail="No available spaCy model was found.")
    nlp_ner = spacy.load(SPACY_MODEL_PATH)

    # concatenate title and description, if description is not null
    if video_description is not None:
        text = video_title + " " + video_description
    else:
        text = video_title

    # remove accents and convert to lowercase
    cleaned_text = unidecode(text.lower().strip())
    cleaned_text = cleaned_text.replace("\n", " ")

    doc = nlp_ner(cleaned_text)

    return [(ent.text, ent.label_) for ent in doc.ents]

@app.post("/spacy/suggestions")
def get_spacy_nlp_suggestions(
    telegram_message_ids: List[int],
    db: Session = Depends(get_db),
):
    # get the messages from the database
    telegram_crud = TelegramCrud(db)
    telegram_messages = telegram_crud.read_telegram_messages_by_ids(telegram_message_ids)
    
    # load the spacy model
    if SPACY_MODEL_PATH is None or not os.path.exists(SPACY_MODEL_PATH):
        raise HTTPException(status_code=500, detail="No available spaCy model was found.")
    nlp_ner = spacy.load(SPACY_MODEL_PATH)

    # for each message, concatenate the title and description and run the spacy model
    for msg in telegram_messages:
        # skip if message is not webpage or if website is not youtube
        if not msg.is_webpage or msg.site_name != "YouTube":
            continue
        
        # get the title and description
        video_title = msg.webpage_title
        video_description = msg.webpage_description

        # concatenate title and description, if description is not null
        if video_description is not None:
            text = video_title + " " + video_description
        else:
            text = video_title

        # remove accents and convert to lowercase
        # cleaned_text = unidecode(text.lower().strip())
        cleaned_text = text.replace("\n", " ").strip()

        # run the spacy model
        doc = nlp_ner(cleaned_text)

        # save suggestions to the message object
        suggestions = {
            "webpage_title": [],
            "webpage_description": []
        }
        for ent in doc.ents:

            title_text_start = video_title.find(ent.text)
            if title_text_start != -1:

                # check if there isnt a suggestion for the same text with the same start and end index
                # this is to avoid duplicates
                if not any(suggestion[0] == title_text_start and suggestion[1] == title_text_start + len(ent.text) for suggestion in suggestions["webpage_title"]):
                    suggestions["webpage_title"].append((title_text_start, title_text_start + len(ent.text), ent.text))

            if video_description is not None:
                descr_text_start = video_description.find(ent.text)
                if descr_text_start != -1:
                    if not any(suggestion[0] == descr_text_start and suggestion[1] == descr_text_start + len(ent.text) for suggestion in suggestions["webpage_description"]):
                        suggestions["webpage_description"].append((descr_text_start, descr_text_start + len(ent.text), ent.text))
                
        msg.suggestions = suggestions
    return telegram_messages
    

@app.get('/musicbrainz/artists/{artist_id}')
def search_musicbrainz_artists(
    artist_id: int,
    db: Session = Depends(get_db),
):
    artist_crud = ArtistCrud(db)
    artist = artist_crud.read_artist(artist_id)
    if artist is None:
        raise HTTPException(status_code=404, detail="artist not found")
    mbz = MusicBrainz()
    mbz_artist = mbz.get_top_scoring_artist(artist.name)
    return mbz_artist


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
