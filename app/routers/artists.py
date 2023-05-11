from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..dependencies import get_db
from ..crud import ArtistCrud
from schemas import ArtistSchema

router = APIRouter(
    prefix="/artists",
    tags=["artists"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[ArtistSchema])
async def read_telegram_message_artists(
    db: Session = Depends(get_db)
):
    artists_crud = ArtistCrud(db)
    artists = artists_crud.read_artists()
    return artists


@router.get('/positions')
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
			}]