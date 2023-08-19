from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..dependencies import get_db
from ..crud import ArtistCrud
from ..schemas import ArtistSchema

router = APIRouter(
    prefix="/artists",
    tags=["artists"],
    responses={
        404: {"description": "Not found"},
        204: {"description": "Success with no content"},
    },
)


@router.get("/", response_model=List[ArtistSchema])
async def read_telegram_message_artists(db: Session = Depends(get_db)):
    artists_crud = ArtistCrud(db)
    artists = artists_crud.read_artists()
    return artists


@router.delete("/{artist_id}", status_code=204)
async def delete_telegram_message_artist(artist_id: int, db: Session = Depends(get_db)):
    artists_crud = ArtistCrud(db)
    artist = artists_crud.read_artist(artist_id)
    if artist is None:
        raise HTTPException(status_code=404, detail="Artist not found")
    artists_crud.delete_artist(artist)


@router.get("/positions")
def get_artists_positions():
    return [
        {
            "position": [51.505, -0.09],
            "name": "Sepultura",
        },
        {
            "position": [51.405, -0.09],
            "name": "Nirvana",
        },
        {
            "position": [51.455, -0.14],
            "name": "Bring me the horizon",
        },
        {
            "position": [51.545, -0.09],
            "name": "Raimundos",
        },
    ]
