import musicbrainzngs
import sys


class MusicBrainz:
    def __init__(self) -> None:
        musicbrainzngs.set_useragent(
            "Mate Hackers DJ", "0.1", "https://guilhermegarcia.dev"
        )

    def get_top_scoring_artist(self, artist_name: str) -> dict:
        result = musicbrainzngs.search_artists(artist=artist_name)
        if result["artist-count"] == 0:
            return []

        suggestions = []
        for suggestion in result["artist-list"]:

            info = {
                "mbid": suggestion["id"],
                "name": suggestion["name"],
                "score": suggestion["ext:score"],
                "life-span-ended": suggestion["life-span"]["ended"],
            }

            if "type" in suggestion:
                info["type"] = suggestion["type"]

            if "area" in suggestion and "name" in suggestion["area"]:
                info["area-name"] = suggestion["area"]["name"]

            if "country" in suggestion:
                info["country"] = suggestion["country"]

            if "begin" in suggestion["life-span"]:
                info["life-span-begin"] = suggestion["life-span"]["begin"]

            if "end" in suggestion["life-span"]:
                info["life-span-end"] = suggestion["life-span"]["end"]

            if "begin-area" in suggestion:
                info["begin-area-name"] = suggestion["begin-area"]["name"]

            if "disambiguation" in suggestion:
                info["disambiguation"] = suggestion["disambiguation"]

            suggestions.append(info)

        return suggestions
