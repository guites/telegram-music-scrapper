"""The Base/Schema format is adapted from https://www.gormanalysis.com/blog/many-to-many-relationships-in-fastapi/
using the association proxy strategy https://docs.sqlalchemy.org/en/20/orm/extensions/associationproxy.html#simplifying-association-objects"""

from pydantic import BaseModel, validator
from sqlalchemy.ext.associationproxy import _AssociationList
from typing import List, Union, Sequence


class BaseModelOrm(BaseModel):
    class Config:
        orm_mode = True


class ArtistBase(BaseModelOrm):
    id: int
    name: str
    latitude: Union[float, None]
    longitude: Union[float, None]


class TelegramMessageBase(BaseModelOrm):
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


class ArtistSchema(ArtistBase):
    telegram_messages: List[TelegramMessageBase]

    # bugfix for association proxies https://github.com/pydantic/pydantic/issues/1038#issuecomment-863797154
    @validator("telegram_messages", pre=True, whole=True)
    def check_roles(cls, v):
        if type(v) is _AssociationList or issubclass(cls, Sequence):
            return list(v)
        raise ValueError("not a valid list")


class TelegramMessageSchema(TelegramMessageBase):
    artists: List[Union[ArtistBase, None]]

    # bugfix for association proxies https://github.com/pydantic/pydantic/issues/1038#issuecomment-863797154
    @validator("artists", pre=True, whole=True)
    def check_roles(cls, v):
        if type(v) is _AssociationList or issubclass(cls, Sequence):
            return list(v)
        raise ValueError("not a valid list")


class TelegramMessageArtistCreate(BaseModel):
    artist_name: str


class TelegramMessageWithArtists(BaseModelOrm):
    class _TelegramMessage(BaseModelOrm):
        id: int
        webpage_title: str
        # webpage_description: str

    # class _Artist(BaseModelOrm):
    #     name: str

    telegram_message: _TelegramMessage
    artist_names: List[str]
