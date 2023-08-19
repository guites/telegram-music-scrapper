import os
import requests
import spacy

from datetime import date
from spacy.tokens import DocBin
from spacy.util import filter_spans
from tqdm import tqdm

nlp = spacy.blank("en")  # load a new spacy model
doc_bin = DocBin()  # create a DocBin object

# get dataset from /spacy/dataset endpoint
response = requests.get("http://localhost:8000/telegram_messages/artists")
data = response.json()

training_data = {"classes": ["artist"], "annotations": data["dataset"]}

for training_example in tqdm(training_data["annotations"]):
    text = training_example["text"]
    labels = training_example["entities"]
    doc = nlp.make_doc(text)
    ents = []
    for start, end, label in labels:
        span = doc.char_span(start, end, label=label, alignment_mode="contract")
        if span is None:
            print("Skipping entity")
        else:
            ents.append(span)
    filtered_ents = filter_spans(ents)
    doc.ents = filtered_ents
    doc_bin.add(doc)

date_dmy = date.today().strftime("%d_%m_%Y")
training_data_file = f"training_data_{date_dmy}.spacy"
if os.path.exists(training_data_file):
    file_postfix = 1
    while os.path.exists(training_data_file):
        training_data_file = f"training_data_{date_dmy}_{file_postfix}.spacy"
        file_postfix = file_postfix + 1

doc_bin.to_disk(training_data_file)  # save the docbin object

# TODO: test trained model on new data: https://newscatcherapi.com/blog/train-custom-named-entity-recognition-ner-model-with-spacy-v3
