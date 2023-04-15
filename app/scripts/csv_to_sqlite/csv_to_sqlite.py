"""This script reads the artist file from musicbrainz json dump and creates a csv file that can be imported into sqlite."""
import os
import pandas as pd
import sys

# TODO: use jq to create .csv from artist file
# jq -r '.[] | [.name, .sort_name, .begin_area_name, .end_area_name, .country, .area.name, .area.sort_name, .life_span.ended, .life_span.begin, .life_span.end, .type] | @csv' artist.json > artist.csv

DATABASE_PATH = os.path.join("../../", "sql_app.db")
ARTIST_DUMP_FILE = os.path.join("artist")

if not os.path.exists(ARTIST_DUMP_FILE):
    print(f"Artist dump file at {ARTIST_DUMP_FILE} does not exist.")
    sys.exit(1)
if not os.path.exists(DATABASE_PATH):
    print(f"Database at {DATABASE_PATH} does not exist.")
    sys.exit(1)

print(f"Located database at {DATABASE_PATH}")
print(f"Located artist dump file at {ARTIST_DUMP_FILE}")

df = pd.read_csv("artist.csv")
for column in df:
    try:
        df[column] = df[column].str.replace(";", "")
        df[column] = df[column].str.replace('"', "")
    except AttributeError:
        pass
df.to_csv("artist-2.csv", sep=";", header=False)

# import using sqlite3 import csv feature
# .mode csv
# .separator ;
# .import artist-2.csv musicbrainz_artists
