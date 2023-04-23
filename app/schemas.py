from pydantic import BaseModel
from typing import List, Union

class TelegramMessageArtistResponse(BaseModel):
    id: int
    telegram_message_id: int
    artist_name: str

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
    is_music: Union[bool, None]
    telegram_message_artists: List[TelegramMessageArtistResponse]

    class Config:
        orm_mode = True

class TelegramMessageResponseWithSuggestions(TelegramMessageResponse):
    suggestions: dict

class TelegramMessageArtistCreate(BaseModel):
    artist_name: str