import createStructFromMatches from './createStructFromMatches';

test('Can create simple struct', () => {
    const matches = [
        {
            start: 14,
            end: 19,
            content: 'Castro',
            type: 'mark',
        },
        {
            start: 70,
            end: 75,
            content: 'Castro',
            type: 'mark',
        },
    ];
    const content =
        'Os Ganhões de Castro Verde, cantam "Grândola, Vila Morena"\nGravado em Castro Verde, Beja, Alentejo (Baixo Alentejo)\n13 de Fevereiro de 2014';

    const struct = createStructFromMatches(matches, content);

    const expectedStruct = [
        {
            start: 0,
            end: 13,
            content: 'Os Ganhões de ',
            type: 'string',
        },
        {
            start: 14,
            end: 19,
            content: 'Castro',
            type: 'mark',
        },
        {
            start: 20,
            end: 69,
            content: ' Verde, cantam "Grândola, Vila Morena"\nGravado em ',
            type: 'string',
        },
        {
            start: 70,
            end: 75,
            content: 'Castro',
            type: 'mark',
        },
        {
            start: 76,
            end: 138,
            content:
                ' Verde, Beja, Alentejo (Baixo Alentejo)\n13 de Fevereiro de 2014',
            type: 'string',
        },
    ];

    expect(struct).toEqual(expectedStruct);
});

test('Regression test to prevent bug where selecting a second mark at the end of the text wouldnt work', () => {
    const matches = [
        {
            start: 13,
            end: 16,
            content: 'Leal',
            type: 'mark',
        },
    ];
    const content = '3 . Djonga - Leal';

    const struct = createStructFromMatches(matches, content);

    const expectedStruct = [
        {
            start: 0,
            end: 12,
            content: '3 . Djonga - ',
            type: 'string',
        },
        {
            start: 13,
            end: 16,
            content: 'Leal',
            type: 'mark',
        },
    ];

    expect(struct).toEqual(expectedStruct);
});
