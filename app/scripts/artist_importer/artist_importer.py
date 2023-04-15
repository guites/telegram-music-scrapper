"""THIS IS OUTDATED AND UNUSED.

Script to import artists from a csv file to the database. Expects a `artists` table with a `name` column."""
import os
import pandas as pd
from sqlalchemy import Column, Integer, String

from database import Base, DatabaseWrapper


class Artist(Base):
    __tablename__ = "artists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)


artists_filepath = os.path.join("artist_names.txt")
artists_file = pd.read_csv(
    artists_filepath,
    sep=";",
)

formatted_artists = []
for _, row in artists_file.iterrows():
    formatted_artists.append(
        Artist(
            name=row["artist"],
        )
    )

with DatabaseWrapper() as db:
    db.bulk_save_objects(formatted_artists)
    db.commit()
