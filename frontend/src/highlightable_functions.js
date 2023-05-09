const getRangeById = (ranges, id) => {
    const rangeById = ranges.find(range => range.id === id);
    if (rangeById) {
        return rangeById.ranges;
    }
    return [];
};

const highlightRange = range => {
    return { ...range, type: 'HIGHLIGHT_RANGE' };
};

const resetHighlightRange = () => {
    return { type: 'RESET_HIGHLIGHTED_RANGE' };
};

const onTextHighlighted = (range, ranges, setRanges) => {
    const receivedRangeId = range.data.id;
    const currRange = ranges.find(range => range.id === receivedRangeId);
    const newRanges = ranges.filter(range => range.id !== receivedRangeId);
    console.log({ currRange, newRanges });
    if (currRange) {
        currRange.ranges.push(highlightRange(range));
        setRanges([...newRanges, currRange]);
    } else {
        console.log(highlightRange(range));
        setRanges([
            ...newRanges,
            {
                id: receivedRangeId,
                ranges: [highlightRange(range)],
            },
        ]);
    }

    window.getSelection().removeAllRanges();
};

const resetHightlight = (range, ranges, setRanges) => {
    const receivedRangeId = range.data.id;
    const currRange = ranges.find(range => range.id === receivedRangeId);
    const newRanges = ranges.filter(range => range.id !== receivedRangeId);

    if (currRange) {
        const selectionToRemove = currRange.ranges.findIndex(
            r => r.start === range.start && r.end === range.end,
        );
        currRange.ranges.splice(selectionToRemove, 1);
        setRanges([...newRanges, currRange]);
    }
};

const batchAddHighlight = (batchRanges, ranges, setRanges) => {
    let newRanges = [...ranges];
    for (const range of batchRanges) {
        const receivedRangeId = range.data.id;
        const currRange = newRanges.find(
            range => range.id === receivedRangeId,
        );
        newRanges = newRanges.filter(
            range => range.id !== receivedRangeId,
        );
        if (currRange) {
            currRange.ranges.push(highlightRange(range));
            newRanges.push(currRange);
        } else {
            newRanges.push({
                id: receivedRangeId,
                ranges: [highlightRange(range)],
            });
        }
    }
    setRanges(newRanges);
};

export {
    batchAddHighlight,
    getRangeById,
    onTextHighlighted,
    resetHightlight,
    resetHighlightRange,
};
