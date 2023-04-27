import ParsedBlock from './parsedBlock';

test('Renders correct block from given object', () => {
    const indexes = [
        {
            block: {
                start: 0,
                end: 5,
                content: 'CRIOLO',
                type: 'suggestion',
            },
            expected: <mark className="suggestion">CRIOLO</mark>,
        },
        {
            block: {
                start: 6,
                end: 8,
                content: ' & ',
                type: 'string',
            },
            expected: <span> & </span>,
        },
        {
            block: {
                start: 9,
                end: 18,
                content: 'Tropkillaz',
                type: 'mark',
            },
            expected: <mark>Tropkillaz</mark>,
        },
        {
            block: {
                start: 19,
                end: 35,
                content: ' - Sistema Obtuso',
                type: 'string',
            },
            expected: <span> - Sistema Obtuso</span>,
        },
    ];

    for (let i = 0; i < indexes.length; i++) {
        const block = indexes[i]['block'];
        const expected = indexes[i]['expected'];
        const parsedBlock = ParsedBlock(block.type, block.content);
        expect(parsedBlock).toEqual(expected);
    }
});
