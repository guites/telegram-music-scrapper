import structCompare from './structCompare';

test.each([
    {
        // full string is "VANUPIÉ - " lenght is 10, indices from 0 to 9
        prevIndexes: [
            {
                "start": 0,
                "end": 9,
                "content": "VANUPIÉ - ",
                "type": "string"
            },
        ],
        newIndexes: [
            {
                "start": 0,
                "end": 6,
                "content": "VANUPIÉ",
                "type": "mark"
            },
            {
                "start": 7,
                "end": 9,
                "content": " - ",
                "type": "string"
            }
        ],
        expected: [
            { start: 0, end: 6, content: 'VANUPIÉ', type: 'mark' },
            { start: 7, end: 9, content: ' - ', type: 'string' }
        ]
    },
    {
        // full string is "Sabotage - Rap é compromisso ft. Mano Brown" lenght is 43, indices from 0 to 42
        prevIndexes: [
            {
                "start": 0,
                "end": 44,
                "content": "Sabotage - Rap é compromisso ft. Mano Brown",
                "type": "string"
            },
        ],
        newIndexes: [
            {
                "start": 0,
                "end": 7,
                "content": "Sabotage",
                "type": "mark"
            },
            {
                "start": 8,
                "end": 42,
                "content": " - Rap é compromisso ft. Mano Brown",
                "type": "string"
            }
        ],
        expected: [
            {
                "start": 0,
                "end": 7,
                "content": "Sabotage",
                "type": "mark"
            },
            {
                "start": 8,
                "end": 42,
                "content": " - Rap é compromisso ft. Mano Brown",
                "type": "string"
            }
        ]
    }
])('Create a mark from a subset of a string', ({ prevIndexes, newIndexes, expected }) => {
    const result = structCompare(prevIndexes, newIndexes);
    expect(result).toEqual(expected);
});

test.each(
    [
        {
            // full string is "BNegão & os seletores de frequência" lenght is 35, indices from 0 to 34
            prevIndexes: [
                {
                    "start": 0,
                    "end": 5,
                    "content": "Bnegão",
                    "type": "suggestion"
                },
                {
                    "start": 6,
                    "end": 34,
                    "content": " & os seletores de frequência",
                    "type": "string"
                }
            ],
            newIndexes: [
                {
                    "start": 0,
                    "end": 34,
                    "content": "BNegão & os seletores de frequência",
                    "type": "mark"
                }
            ],
            expected: [{
                "start": 0,
                "end": 34,
                "content": "BNegão & os seletores de frequência",
                "type": "mark"
            }]
        },
        {
            // full string is "BNegão & os seletores de frequência - Enxugando gelo" lenght is 52, indices from 0 to 51
            prevIndexes: [
                {
                    "start": 0,
                    "end": 5,
                    "content": "Bnegão",
                    "type": "suggestion"
                },
                {
                    "start": 6,
                    "end": 51,
                    "content": " & os seletores de frequência - Enxugando gelo",
                    "type": "string"
                }
            ],
            newIndexes: [
                {
                    "start": 0,
                    "end": 34,
                    "content": "BNegão & os seletores de frequência",
                    "type": "mark"
                },
                {
                    "start": 35,
                    "end": 51,
                    "content": " - Enxugando gelo",
                    "type": "string"
                }
            ],
            expected: [{
                "start": 0,
                "end": 34,
                "content": "BNegão & os seletores de frequência",
                "type": "mark",
            },
            {
                "start": 35,
                "end": 51,
                "content": " - Enxugando gelo",
                "type": "string"
            }]
        },
        {
            // full string is "CRIOLO & Tropkillaz - Sistema Obtuso" length is 36, indices from 0 to 35
            prevIndexes: [
                {
                    "start": 0,
                    "end": 18,
                    "content": "CRIOLO & Tropkillaz",
                    "type": "suggestion"
                },
                {
                    "start": 19,
                    "end": 35,
                    "content": " - Sistema Obtuso",
                    "type": "string"
                }
            ],
            newIndexes: [
                {
                    "start": 0,
                    "end": 5,
                    "content": "CRIOLO",
                    "type": "mark"
                },
                {
                    "start": 6,
                    "end": 35,
                    "content": " & Tropkillaz - Sistema Obtuso",
                    "type": "string"
                }
            ],
            expected: [
                {
                    "start": 0,
                    "end": 5,
                    "content": "CRIOLO",
                    "type": "mark"
                },
                {
                    "start": 6,
                    "end": 35,
                    "content": " & Tropkillaz - Sistema Obtuso",
                    "type": "string"
                }
            ]
        },
        {
            // full string is "CRIOLO & Tropkillaz - Sistema Obtuso" length is 36, indices from 0 to 35
            prevIndexes: [
                {
                    "start": 0,
                    "end": 5,
                    "content": "CRIOLO",
                    "type": "suggestion"
                },
                {
                    "start": 6,
                    "end": 35,
                    "content": " & Tropkillaz - Sistema Obtuso",
                    "type": "string"
                },
            ],
            newIndexes: [
                {
                    "start": 0,
                    "end": 8,
                    "content": "CRIOLO & ",
                    "type": "string"
                },
                {
                    "start": 9,
                    "end": 18,
                    "content": "Tropkillaz",
                    "type": "mark",
                },
                {
                    "start": 19,
                    "end": 35,
                    "content": " - Sistema Obtuso",
                    "type": "string"
                }
            ],
            expected: [
                {
                    "start": 0,
                    "end": 5,
                    "content": "CRIOLO",
                    "type": "suggestion"
                },
                {
                    "start": 6,
                    "end": 8,
                    "content": " & ",
                    "type": "string"
                },
                {
                    "start": 9,
                    "end": 18,
                    "content": "Tropkillaz",
                    "type": "mark",
                },
                {
                    "start": 19,
                    "end": 35,
                    "content": " - Sistema Obtuso",
                    "type": "string"
                }
            ]
        }
    ])(`Marks removes overlapping suggestions and creates strings with remaining text`, ({ prevIndexes, newIndexes, expected }) => {
        const result = structCompare(prevIndexes, newIndexes);
        expect(result).toEqual(expected);
    });

test("Can go from suggestions and strings to marks, suggestions and strings", () => {

    // full string is "VANUPIÉ - ROCKADOWN - SUBWAY SESSION (FEAT. LIDIOP)" length 51, indices 0 to 50
    const prevIndexes = [
        {
            "start": 0,
            "end": 6,
            "content": "VANUPIÉ",
            "type": "suggestion"
        },
        {
            "start": 7,
            "end": 50,
            "content": " - ROCKADOWN - SUBWAY SESSION (FEAT. LIDIOP)",
            "type": "string"
        }
    ];

    const newIndexes = [
        {
            "start": 0,
            "end": 9,
            "content": "VANUPIÉ - ",
            "type": "string",
        },
        {
            "start": 10,
            "end": 18,
            "content": "ROCKADOWN",
            "type": "mark"
        },
        {
            "start": 19,
            "end": 50,
            "content": " - SUBWAY SESSION (FEAT. LIDIOP)",
            "type": "string"
        }
    ];

    const expected = [
        {
            "start": 0,
            "end": 6,
            "content": "VANUPIÉ",
            "type": "suggestion",
        },
        {
            "start": 7,
            "end": 9,
            "content": " - ",
            "type": "string",
        },
        {
            "start": 10,
            "end": 18,
            "content": "ROCKADOWN",
            "type": "mark"
        },
        {
            "start": 19,
            "end": 50,
            "content": " - SUBWAY SESSION (FEAT. LIDIOP)",
            "type": "string"
        }
    ];

    const result = structCompare(prevIndexes, newIndexes);
    expect(result).toEqual(expected);
});

test("Can go from string to a mark between strings", () => {

    const prevIndexes = [
        {
            "start": 0,
            "end": 37,
            "content": "The great band Led Zeppelin plays live", // length 38, indexes 0 to 37
            "type": "string"
        },
    ];
    const newIndexes = [
        {
            "start": 0,
            "end": 14,
            "content": "The great band ",
            "type": "string"
        },
        {
            "start": 15,
            "end": 26,
            "content": "Led Zeppelin",
            "type": "mark"
        },
        {
            "start": 27,
            "end": 37,
            "content": " plays live",
            "type": "string"
        },
    ];

    const expected = [
        {
            "start": 0,
            "end": 14,
            "content": "The great band ",
            "type": "string"
        },
        {
            "start": 15,
            "end": 26,
            "content": "Led Zeppelin",
            "type": "mark"
        },
        {
            "start": 27,
            "end": 37,
            "content": " plays live",
            "type": "string"
        },
    ];

    const result = structCompare(prevIndexes, newIndexes);
    expect(result).toEqual(expected);
});

export default TestComp;