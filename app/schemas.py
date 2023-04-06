from pydantic import BaseModel


class MusicBrainzArtistResponse(BaseModel):
    id: str
    name: str
    mbid: str
    sort_name: str
    begin_area_name: str | None
    end_area_name: str | None
    country: str | None
    area_name: str | None
    area_sort_name: str | None
    life_span_ended: bool
    life_span_begin: str | None
    life_span_end: str | None
    type: str | None

    class Config:
        orm_mode = True


class TelegramMessageResponse(BaseModel):
    id: int
    telegram_id: int
    date: str | None
    message: str
    is_webpage: bool | None
    site_name: str | None
    webpage_url: str | None
    webpage_title: str | None
    webpage_description: str | None
    musicbrainz_artist: MusicBrainzArtistResponse | None

    class Config:
        orm_mode = True
