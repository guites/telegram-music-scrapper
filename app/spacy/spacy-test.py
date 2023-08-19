import spacy

nlp = spacy.load("en_core_web_sm")

text = """
Empty Vessels Make The Loudest Sound by The Mars Volta (from the album Noctourniquet).

September 25, 2022
"""

# Process the text
doc = nlp(text)

# Iterate over the tokens
for ent in doc.ents:
    # Print the entity text and its label
    print(ent.text, ent.label_)

# Get the span for "The Mars Volta"
mars_volta = doc[0]

# Print the span text
print("Missing entity:", mars_volta.text)
