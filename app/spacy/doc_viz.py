"""Based on https://spacy.io/usage/visualizers#ent"""
import random
import requests
import spacy

from spacy import displacy
from spacy.tokens import Span
from spacy.util import filter_spans

# get dataset from /spacy/dataset endpoint
response = requests.get("http://localhost:8000/spacy/dataset")
data = response.json()

nlp = spacy.blank("en")

examples = random.choices(data['dataset'], k=30)

all_docs = []

for example in examples:
    doc = nlp.make_doc(example['text'])
    ents = []

    for start, end, label in example['entities']:
        span = doc.char_span(start, end, label=label, alignment_mode="contract")
        if span is None:
            print("Skipping entity")
        else:
            ents.append(span)
        filtered_ents = filter_spans(ents)
        doc.ents = filtered_ents
    all_docs.append(doc)
    if len(all_docs) > 30:
        break

displacy.serve(all_docs, style="ent", auto_select_port=True)