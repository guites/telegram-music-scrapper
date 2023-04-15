from pydantic import BaseModel
from typing import Union

class MusicBrainzArtistResponse(BaseModel):
    id: str
    name: str
    mbid: str
    sort_name: str
    begin_area_name: Union[str, None]
    end_area_name: Union[str, None]
    country: Union[str, None]
    area_name: Union[str, None]
    area_sort_name: Union[str, None]
    life_span_ended: bool
    life_span_begin: Union[str, None]
    life_span_end: Union[str, None]
    type: Union[str, None]

    class Config:
        orm_mode = True


class TelegramMessageResponse(BaseModel):
    id: int
    telegram_id: int
    date: Union[str, None]
    message: str
    is_webpage: Union[bool, None]
    site_name: Union[str, None]
    webpage_url: Union[str, None]
    webpage_title: Union[str, None]
    webpage_description: Union[str, None]
    musicbrainz_artist: Union[MusicBrainzArtistResponse, None]
    is_music: Union[bool, None]

    class Config:
        orm_mode = True
