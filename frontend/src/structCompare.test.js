import structCompare from './structCompare';

test.each([
    {
        // full string is "VANUPIÉ - " lenght is 10, indices from 0 to 9
        prevIndexes: [
            {
                start: 0,
                end: 9,
                content: 'VANUPIÉ - ',
                type: 'string',
            },
        ],
        newIndexes: [
            {
                start: 0,
                end: 6,
                content: 'VANUPIÉ',
                type: 'mark',
            },
            {
                start: 7,
                end: 9,
                content: ' - ',
                type: 'string',
            },
        ],
        expected: [
            { start: 0, end: 6, content: 'VANUPIÉ', type: 'mark' },
            { start: 7, end: 9, content: ' - ', type: 'string' },
        ],
    },
    {
        // full string is "Sabotage - Rap é compromisso ft. Mano Brown" lenght is 43, indices from 0 to 42
        prevIndexes: [
            {
                start: 0,
                end: 44,
                content: 'Sabotage - Rap é compromisso ft. Mano Brown',
                type: 'string',
            },
        ],
        newIndexes: [
            {
                start: 0,
                end: 7,
                content: 'Sabotage',
                type: 'mark',
            },
            {
                start: 8,
                end: 42,
                content: ' - Rap é compromisso ft. Mano Brown',
                type: 'string',
            },
        ],
        expected: [
            {
                start: 0,
                end: 7,
                content: 'Sabotage',
                type: 'mark',
            },
            {
                start: 8,
                end: 42,
                content: ' - Rap é compromisso ft. Mano Brown',
                type: 'string',
            },
        ],
    },
])(
    'Create a mark from a subset of a string',
    ({ prevIndexes, newIndexes, expected }) => {
        const result = structCompare(prevIndexes, newIndexes);
        expect(result).toEqual(expected);
    },
);

test.each([
    {
        // full string is "BNegão & os seletores de frequência" lenght is 35, indices from 0 to 34
        prevIndexes: [
            {
                start: 0,
                end: 5,
                content: 'Bnegão',
                type: 'suggestion',
            },
            {
                start: 6,
                end: 34,
                content: ' & os seletores de frequência',
                type: 'string',
            },
        ],
        newIndexes: [
            {
                start: 0,
                end: 34,
                content: 'BNegão & os seletores de frequência',
                type: 'mark',
            },
        ],
        expected: [
            {
                start: 0,
                end: 34,
                content: 'BNegão & os seletores de frequência',
                type: 'mark',
            },
        ],
    },
    {
        // full string is "BNegão & os seletores de frequência - Enxugando gelo" lenght is 52, indices from 0 to 51
        prevIndexes: [
            {
                start: 0,
                end: 5,
                content: 'Bnegão',
                type: 'suggestion',
            },
            {
                start: 6,
                end: 51,
                content: ' & os seletores de frequência - Enxugando gelo',
                type: 'string',
            },
        ],
        newIndexes: [
            {
                start: 0,
                end: 34,
                content: 'BNegão & os seletores de frequência',
                type: 'mark',
            },
            {
                start: 35,
                end: 51,
                content: ' - Enxugando gelo',
                type: 'string',
            },
        ],
        expected: [
            {
                start: 0,
                end: 34,
                content: 'BNegão & os seletores de frequência',
                type: 'mark',
            },
            {
                start: 35,
                end: 51,
                content: ' - Enxugando gelo',
                type: 'string',
            },
        ],
    },
    {
        // full string is "CRIOLO & Tropkillaz - Sistema Obtuso" length is 36, indices from 0 to 35
        prevIndexes: [
            {
                start: 0,
                end: 18,
                content: 'CRIOLO & Tropkillaz',
                type: 'suggestion',
            },
            {
                start: 19,
                end: 35,
                content: ' - Sistema Obtuso',
                type: 'string',
            },
        ],
        newIndexes: [
            {
                start: 0,
                end: 5,
                content: 'CRIOLO',
                type: 'mark',
            },
            {
                start: 6,
                end: 35,
                content: ' & Tropkillaz - Sistema Obtuso',
                type: 'string',
            },
        ],
        expected: [
            {
                start: 0,
                end: 5,
                content: 'CRIOLO',
                type: 'mark',
            },
            {
                start: 6,
                end: 35,
                content: ' & Tropkillaz - Sistema Obtuso',
                type: 'string',
            },
        ],
    },
    {
        // full string is "CRIOLO & Tropkillaz - Sistema Obtuso" length is 36, indices from 0 to 35
        prevIndexes: [
            {
                start: 0,
                end: 5,
                content: 'CRIOLO',
                type: 'suggestion',
            },
            {
                start: 6,
                end: 35,
                content: ' & Tropkillaz - Sistema Obtuso',
                type: 'string',
            },
        ],
        newIndexes: [
            {
                start: 0,
                end: 8,
                content: 'CRIOLO & ',
                type: 'string',
            },
            {
                start: 9,
                end: 18,
                content: 'Tropkillaz',
                type: 'mark',
            },
            {
                start: 19,
                end: 35,
                content: ' - Sistema Obtuso',
                type: 'string',
            },
        ],
        expected: [
            {
                start: 0,
                end: 5,
                content: 'CRIOLO',
                type: 'suggestion',
            },
            {
                start: 6,
                end: 8,
                content: ' & ',
                type: 'string',
            },
            {
                start: 9,
                end: 18,
                content: 'Tropkillaz',
                type: 'mark',
            },
            {
                start: 19,
                end: 35,
                content: ' - Sistema Obtuso',
                type: 'string',
            },
        ],
    },
])(
    `Marks removes overlapping suggestions and creates strings with remaining text`,
    ({ prevIndexes, newIndexes, expected }) => {
        const result = structCompare(prevIndexes, newIndexes);
        expect(result).toEqual(expected);
    },
);

test('Can go from suggestions and strings to marks, suggestions and strings', () => {
    // full string is "VANUPIÉ - ROCKADOWN - SUBWAY SESSION (FEAT. LIDIOP)" length 51, indices 0 to 50
    const prevIndexes = [
        {
            start: 0,
            end: 6,
            content: 'VANUPIÉ',
            type: 'suggestion',
        },
        {
            start: 7,
            end: 50,
            content: ' - ROCKADOWN - SUBWAY SESSION (FEAT. LIDIOP)',
            type: 'string',
        },
    ];

    const newIndexes = [
        {
            start: 0,
            end: 9,
            content: 'VANUPIÉ - ',
            type: 'string',
        },
        {
            start: 10,
            end: 18,
            content: 'ROCKADOWN',
            type: 'mark',
        },
        {
            start: 19,
            end: 50,
            content: ' - SUBWAY SESSION (FEAT. LIDIOP)',
            type: 'string',
        },
    ];

    const expected = [
        {
            start: 0,
            end: 6,
            content: 'VANUPIÉ',
            type: 'suggestion',
        },
        {
            start: 7,
            end: 9,
            content: ' - ',
            type: 'string',
        },
        {
            start: 10,
            end: 18,
            content: 'ROCKADOWN',
            type: 'mark',
        },
        {
            start: 19,
            end: 50,
            content: ' - SUBWAY SESSION (FEAT. LIDIOP)',
            type: 'string',
        },
    ];

    const result = structCompare(prevIndexes, newIndexes);
    expect(result).toEqual(expected);
});

test('Can go from string to a mark between strings', () => {
    const prevIndexes = [
        {
            start: 0,
            end: 37,
            content: 'The great band Led Zeppelin plays live', // length 38, indexes 0 to 37
            type: 'string',
        },
    ];
    const newIndexes = [
        {
            start: 0,
            end: 14,
            content: 'The great band ',
            type: 'string',
        },
        {
            start: 15,
            end: 26,
            content: 'Led Zeppelin',
            type: 'mark',
        },
        {
            start: 27,
            end: 37,
            content: ' plays live',
            type: 'string',
        },
    ];

    const expected = [
        {
            start: 0,
            end: 14,
            content: 'The great band ',
            type: 'string',
        },
        {
            start: 15,
            end: 26,
            content: 'Led Zeppelin',
            type: 'mark',
        },
        {
            start: 27,
            end: 37,
            content: ' plays live',
            type: 'string',
        },
    ];

    const result = structCompare(prevIndexes, newIndexes);
    expect(result).toEqual(expected);
});

test.skip('Can create a mark that overlaps an existing mark', () => {
    // we are not dealing with mark overlaps yet
    const prevIndexes = [
        {
            start: 0,
            end: 2,
            content: 'Os ',
            type: 'string',
        },
        {
            start: 3,
            end: 9,
            content: 'Ganhões',
            type: 'mark',
        },
        {
            start: 10,
            end: 138,
            content:
                ' de Castro Verde, cantam "Grândola, Vila Morena"\nGravado em Castro Verde, Beja, Alentejo (Baixo Alentejo)\n13 de Fevereiro de 2014',
            type: 'string',
        },
    ];

    const newIndexes = [
        {
            start: 0,
            end: 25,
            content: 'Os Ganhões de Castro Verde',
            type: 'mark',
        },
        {
            start: 26,
            end: 138,
            content:
                ', cantam "Grândola, Vila Morena"\nGravado em Castro Verde, Beja, Alentejo (Baixo Alentejo)\n13 de Fevereiro de 2014',
            type: 'string',
        },
    ];

    const expected = [
        {
            start: 0,
            end: 25,
            content: 'Os Ganhões de Castro Verde',
            type: 'mark',
        },
        {
            start: 26,
            end: 138,
            content:
                ', cantam "Grândola, Vila Morena"\nGravado em Castro Verde, Beja, Alentejo (Baixo Alentejo)\n13 de Fevereiro de 2014',
            type: 'string',
        },
    ];

    const result = structCompare(prevIndexes, newIndexes);

    expect(result).toEqual(expected);
});

test('Regression test to prevent bug where comparing string to suggestion duplicates the text', () => {
    const prevIndexes = [
        {
            start: 0,
            end: 16,
            content: '3 . Djonga - Leal',
            type: 'string',
        },
    ];

    const newIndexes = [
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

    const expected = [
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

    const result = structCompare(prevIndexes, newIndexes);

    expect(result).toEqual(expected);
});

test('Regression test to prevent bug where selecting a second mark at the end of the text wouldnt work', () => {
    // full string is "3 . Djonga - Leal"

    const prevIndex = [
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
            type: 'mark',
        },
        {
            start: 10,
            end: 16,
            content: ' - Leal',
            type: 'string',
        },
    ];

    const newIndex = [
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

    const expected = [
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
            type: 'mark',
        },
        {
            start: 10,
            end: 12,
            content: ' - ',
            type: 'string',
        },
        {
            start: 13,
            end: 16,
            content: 'Leal',
            type: 'mark',
        },
    ];

    const result = structCompare(prevIndex, newIndex);

    expect(result).toEqual(expected);
});

test('Regression test to prevent bug where selecting a multiple marks would result in empty strings appearing in the structure', () => {
    const prevIndexes = [
        {
            start: 0,
            end: 3,
            content: '3 . ',
            type: 'mark',
        },
        {
            start: 4,
            end: 9,
            content: 'Djonga',
            type: 'mark',
        },
        {
            start: 10,
            end: 12,
            content: ' - ',
            type: 'string',
        },
        {
            start: 13,
            end: 16,
            content: 'Leal',
            type: 'mark',
        },
    ];

    const newIndexes = [
        {
            start: 0,
            end: 10,
            content: '3 . Djonga ',
            type: 'string',
        },
        {
            start: 11,
            end: 12,
            content: '- ',
            type: 'mark',
        },
        {
            start: 13,
            end: 16,
            content: 'Leal',
            type: 'string',
        },
    ];

    const expected = [
        {
            start: 0,
            end: 3,
            content: '3 . ',
            type: 'mark',
        },
        {
            start: 4,
            end: 9,
            content: 'Djonga',
            type: 'mark',
        },
        {
            start: 10,
            end: 10,
            content: ' ',
            type: 'string',
        },
        {
            start: 11,
            end: 12,
            content: '- ',
            type: 'mark',
        },
        {
            start: 13,
            end: 16,
            content: 'Leal',
            type: 'mark',
        },
    ];

    const result = structCompare(prevIndexes, newIndexes);
    console.log(result);
    expect(result).toEqual(expected);
});
