const createStructFromMatches = (matches, content) => {
    const struct = [];
    let lastEnd = 0;
    matches.forEach((match, idx) => {
        if (match.start > lastEnd) {
            struct.push({
                start: lastEnd === 0 ? lastEnd : lastEnd + 1,
                end: match.start - 1,
                content: content.substring(
                    lastEnd === 0 ? lastEnd : lastEnd + 1,
                    match.start,
                ),
                type: 'string',
            });
        }
        struct.push({
            start: match.start,
            end: match.end,
            content: content.substring(match.start, match.end + 1),
            type: 'mark',
        });
        lastEnd = match.end;
    });
    if (lastEnd < content.length - 1) {
        struct.push({
            start: lastEnd === 0 ? lastEnd : lastEnd + 1,
            end: content.length - 1,
            content: content.substring(lastEnd + 1, content.length),
            type: 'string',
        });
    }
    return struct;
};

export default createStructFromMatches;
