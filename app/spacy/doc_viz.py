"""Based on https://spacy.io/usage/visualizers#ent"""
import json
import spacy

from spacy import displacy
from spacy.tokens import Span
from spacy.util import filter_spans

with open('data.json', 'r') as f:
    data = json.load(f)

nlp = spacy.blank("en")

example = data[7]
print(f"Example text length: {len(example['text'])}")

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

displacy.serve(doc, style="ent", auto_select_port=True)