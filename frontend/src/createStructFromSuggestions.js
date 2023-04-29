const createStructFromSuggestions = (suggestions, content) => {
    const struct = [];
    let lastEnd = 0;
    suggestions.forEach(suggestion => {
        if (suggestion[0] > lastEnd) {
            struct.push({
                start: lastEnd,
                end: suggestion[0] - 1,
                content: content.substring(lastEnd, suggestion[0]),
                type: 'string',
            });
        }
        struct.push({
            start: suggestion[0],
            end: suggestion[1] - 1, // -1 because the on the api the end is exclusive, i.e. up to but not including the end index
            content: content.substring(suggestion[0], suggestion[1]),
            type: 'suggestion',
        });
        lastEnd = suggestion[1];
    });
    if (lastEnd < content.length) {
        struct.push({
            start: lastEnd,
            end: content.length - 1,
            content: content.substring(lastEnd, content.length),
            type: 'string',
        });
    }
    return struct;
};

export default createStructFromSuggestions;
