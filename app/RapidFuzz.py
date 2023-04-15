from typing import List
from unidecode import unidecode
from rapidfuzz import process as rapidfuzz_process


class RapidFuzz:
    def __init__(self, data_pool):
        self.process = rapidfuzz_process
        self.data_pool = data_pool

    def _extract_processor(self, x):
        return unidecode(x.lower().strip())

    def extract_single(self, query: str, limit: int = 5):
        return {
            "match": self.process.extract(
                query, self.data_pool, processor=self._extract_processor, limit=limit
            ),
            "query": query,
        }

    def extract_list(self, query: List[str], limit: int = 5):
        results = []
        for q in query:
            results.append(
                {
                    "match": self.process.extract(
                        q,
                        self.data_pool,
                        processor=self._extract_processor,
                        limit=limit,
                    ),
                    "query": q,
                }
            )
        return results
