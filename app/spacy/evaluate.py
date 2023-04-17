import spacy

from spacy import displacy

nlp_ner = spacy.load("model-last")

doc = nlp_ner("Violeta de Outono - Dia Eterno")

colors = {"artist": "linear-gradient(90deg, #aa9cfc, #fc9ce7)"}

options = {"colors": colors}

displacy.serve(doc, style="ent", options=options)