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

from models import Base

from crud import ArtistCrud, TelegramCrud
from database import engine
from definitions import SPACY_MODEL_PATH
from dependencies import get_db
from routers import artists, telegram_messages
from MusicBrainz import MusicBrainz

Base.metadata.create_all(bind=engine)

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


@app.get("/musicbrainz/artists/{artist_id}")
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
