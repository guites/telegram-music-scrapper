import createStructFromSuggestions from './createStructFromSuggestions';

test('Regression test to prevent bug where parsed text is being duplicated', () => {
    const webpage_title = '3 . Djonga - Leal';
    const title_suggestions = [[4, 10, 'Djonga']];

    const struct = createStructFromSuggestions(
        title_suggestions,
        webpage_title,
    );

    const expectedStruct = [
        {
            start: 0,
            end: 3,
            content: '3 . ',
            type: 'string',
        },
        {
            start: 4,
            end: 9,
            content: 'Djonga',
            type: 'suggestion',
        },
        {
            start: 10,
            end: 16,
            content: ' - Leal',
            type: 'string',
        },
    ];

    expect(struct).toEqual(expectedStruct);
});
