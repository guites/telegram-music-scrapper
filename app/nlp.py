def get_suggestions_from_telegram_messages(nlp_model, telegram_messages):
    # for each message, get the youtube video title and run through the spacy model
    for msg in telegram_messages:
        # skip if message is not webpage or if website is not youtube
        if not msg.is_webpage or msg.site_name != "YouTube":
            continue

        # save the title as the inference text
        text = msg.webpage_title

        # run the spacy model
        doc = nlp_model(text)

        # save suggestions to the message object
        suggestions = {"webpage_title": []}
        for ent in doc.ents:
            title_text_start = text.find(ent.text)
            if title_text_start != -1:
                # check if there isnt a suggestion for the same text with the same start and end index
                # this is to avoid duplicates
                if not any(
                    suggestion[0] == title_text_start
                    and suggestion[1] == title_text_start + len(ent.text)
                    for suggestion in suggestions["webpage_title"]
                ):
                    suggestions["webpage_title"].append(
                        (title_text_start, title_text_start + len(ent.text), ent.text)
                    )

        msg.suggestions = suggestions
    return telegram_messages
