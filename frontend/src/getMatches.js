const getMatches = (content, regex, searchString) => {
    const selection = [];
    let matchArr = null;
    while (null != (matchArr = regex.exec(content))) {
        selection.push({
            start: matchArr.index,
            end: regex.lastIndex - 1,
            content: searchString,
            type: 'mark',
        });
    }
    return selection;
};

export default getMatches;
