from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..dependencies import get_db
from ..crud import ArtistCrud
from ..schemas import ArtistSchema, ArtistPositions

router = APIRouter(
    prefix="/artists",
    tags=["artists"],
    responses={404: {"description": "Not found"}, 204: {"description": "Success with no content"}},
)

@router.get("/", response_model=List[ArtistSchema])
async def read_telegram_message_artists(
    db: Session = Depends(get_db)
):
    artists_crud = ArtistCrud(db)
    artists = artists_crud.read_artists()
    return artists

@router.delete("/{artist_id}", status_code=204)
async def delete_telegram_message_artist(
    artist_id: int,
	db: Session = Depends(get_db)
):
	artists_crud = ArtistCrud(db)
	artist = artists_crud.read_artist(artist_id)
	if artist is None:
		raise HTTPException(status_code=404, detail="Artist not found")
	artists_crud.delete_artist(artist)


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

@router.post('/{artist_id}/positions', response_model=ArtistSchema)
def post_create_artist_position(
   artist_id: int,
   positions: ArtistPositions,
	db: Session = Depends(get_db)
):

	# Pesquisar id no banco de dados, e ver se o artista existe
	artists_crud = ArtistCrud(db)
	artist = artists_crud.read_artist(artist_id)
	# Se não existir retornar um erro
	if artist is None:
		raise HTTPException(status_code=404, detail="Artist not found")

	# Se existir, atualizar o campo latitude e longitude com o valor recebido na requisição.
	artist = artists_crud.update_artist_position(artist, positions)
	return artist