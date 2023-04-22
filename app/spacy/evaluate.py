import argparse
import spacy
import time

from spacy import displacy


def main(args):
    # load the model
    load_start = time.time()
    nlp_ner = spacy.load(args.model)
    print("Model loaded in {:.2f} seconds".format(time.time() - load_start))
    
    # evaluate the text
    eval_start = time.time()
    doc = nlp_ner(args.text)
    print("Text evaluated in {:.2f} seconds".format(time.time() - eval_start))
    
    # run displacy.serve if display is True
    if args.display:
        colors = {"artist": "linear-gradient(90deg, #aa9cfc, #fc9ce7)"}
        options = {"colors": colors}
        displacy.serve(doc, style="ent", options=options, auto_select_port=True)
    else:
        # print the entities
        print([(ent.text, ent.label_) for ent in doc.ents])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Evaluate a text with a spaCy NER model"
    )
    parser.add_argument("text", help="text to be evaluated", type=str)
    parser.add_argument("-m", "--model", help="model to be used", default="model-last")
    parser.add_argument(
        "-d", "--display", help="display the result", action="store_true", default=False
    )
    args = parser.parse_args()

    main(args)
