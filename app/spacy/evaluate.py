import argparse
import spacy

from spacy import displacy

def main(args):
    # load the model
    nlp_ner = spacy.load("model-last")

    # evaluate the text
    doc = nlp_ner(args.text)

    # run displacy.serve if display is True
    if args.display:
        colors = {"artist": "linear-gradient(90deg, #aa9cfc, #fc9ce7)"}
        options = {"colors": colors}
        displacy.serve(doc, style="ent", options=options, auto_select_port=True)
    else:
        # print the entities
        print([(ent.text, ent.label_) for ent in doc.ents])
    
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate a text with a spaCy NER model")
    parser.add_argument("text", help="text to be evaluated", type=str)
    parser.add_argument("-m", "--model", help="model to be used", default="model-last")
    parser.add_argument("-d", "--display", help="display the result", action="store_true", default=False)
    args = parser.parse_args()
    
    main(args)