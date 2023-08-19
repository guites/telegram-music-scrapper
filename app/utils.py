import os
import sys

from definitions import ARTISTS_FILE_PATH


def check_artist_names_file():
    if ARTISTS_FILE_PATH is None:
        print("Please define the ARTISTS_FILE_PATH environment variable.")
        sys.exit(1)
    if not os.path.exists(ARTISTS_FILE_PATH):
        print(f"File {ARTISTS_FILE_PATH} does not exist.")
        sys.exit(1)
    return ARTISTS_FILE_PATH
