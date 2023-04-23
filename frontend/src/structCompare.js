function structCompare(prevIndexes, newIndexes) {
    // merge the two arrays
    const mergedIndexes = [...prevIndexes, ...newIndexes];
    // sort by start and then end
    mergedIndexes.sort((a, b) => a.start - b.start || a.end - b.end);
    // by "overlap" we mean that the current index starts before the next index ends

    // if a mark overlaps with a suggestion, remove the suggestion and create a new string with the remaining content
    // if a mark overlaps with a string, keep the mark and create a new string with the remaining content
    // TODO: what if a mark overlaps with a mark?

    // if a suggestion overlaps with a string, keep the suggestion and create a new string with the remaining content
    // if a string overlaps with a string, merge the two strings
    // TODO: what if a suggestion overlaps with a suggestion?


    let index, nextIndex, newString, newStringContent;

    for (let i = 0; i < mergedIndexes.length; i++) {
        index = mergedIndexes[i];
        nextIndex = mergedIndexes[i + 1];
        if (!nextIndex || nextIndex.start > index.end) {
            // no overlap
            continue;
        }
        // console.log(`overlap between ${index.type} and ${nextIndex.type}`);
        if (index.type === 'string') {
            if (nextIndex.type === 'mark') {
                // create a new string with the remaining content, if any
                if (index.end > nextIndex.end) {
                    newString = {
                        start: index.start,
                        end: nextIndex.start -1,
                        content: index.content.substring(0, index.content.indexOf(nextIndex.content)),
                        type: 'string'
                    }
                    // remove the old string and insert the new one
                    mergedIndexes.splice(i, 1, newString);
                } else {
                    // remove the mark
                    mergedIndexes.splice(i + 1, 1);
                }
            }
            if (nextIndex.type === 'string') {
                // concatenate the two strings without repeating the content
                if (nextIndex.content === index.content) {
                    newStringContent = index.content;
                } else if (index.content.endsWith(nextIndex.content)) {
                    newStringContent = index.content;
                } else if (nextIndex.content.startsWith(index.content)) {
                    newStringContent = nextIndex.content;
                } else {
                    newStringContent = index.content + nextIndex.content;
                }
                newString = {
                    start: index.start,
                    end: nextIndex.end,
                    content: newStringContent,
                    type: 'string'
                }

                // remove the old string and insert the new one
                mergedIndexes.splice(i, 2, newString);
                i = i -1; // splicing seems to make the for loop skip the next index
            }
        }
        if (index.type === 'mark') {
            if (nextIndex.type === 'suggestion') {
                // remove the suggestion and create a new string with the remaining content, if any
                if (index.end < nextIndex.end) {
                    newString = {
                        start: index.end + 1,
                        end: nextIndex.end,
                        content: nextIndex.content.slice(1 + index.end - nextIndex.start),
                        type: 'string'
                    }
                    mergedIndexes.splice(i + 1, 1, newString);
                } else {
                    // remove the suggestion
                    mergedIndexes.splice(i + 1, 1);
                }
            }
            if (nextIndex.type === 'string') {
                // create a new string with the remaining content, if any
                if (index.end < nextIndex.end) {
                    newString = {
                        start: index.end + 1,
                        end: nextIndex.end,
                        content: nextIndex.content.slice(1 + index.end - nextIndex.start),
                        type: 'string'
                    }
                    // remove the old string and insert the new one
                    mergedIndexes.splice(i + 1, 1, newString);
                } else {
                    // remove the string
                    mergedIndexes.splice(i + 1, 1);
                }
            }
            continue;
        }
        if (index.type === 'suggestion') {
            if (nextIndex.type === 'mark') {
                // remove the suggestion and create a new string with the remaining content, if any
                if (index.end > nextIndex.end) {
                    newString = {
                        start: nextIndex.end,
                        end: index.end,
                        content: index.content.slice(index.end - nextIndex.end),
                        type: 'string'
                    }
                    // remove the old suggestion and insert the new string
                    mergedIndexes.splice(i, 1, newString);
                } else {
                    // remove the suggestion
                    mergedIndexes.splice(i, 1);
                    i = i -1; // splicing seems to make the for loop skip the next index
                }
            }
            if (nextIndex.type === 'string') {
                // keep the suggestion and create a new string with the remaining content, if any
                if (index.end < nextIndex.end) {
                    newString = {
                        start: index.end + 1,
                        end: nextIndex.end,
                        content: nextIndex.content.slice(1 + index.end - nextIndex.start),
                        type: 'string'
                    }
                    // remove the old string and insert the new one
                    mergedIndexes.splice(i + 1, 1, newString);
                }
            }
        }
    }

    return mergedIndexes;
}

export default structCompare;


