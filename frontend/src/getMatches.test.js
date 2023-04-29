import getMatches from './getMatches';
import escapeRegExp from './escapeRegExp';

test('Can get matches from content', () => {
    const selectedStr = 'Castro';
    const content =
        'Os Ganhões de Castro Verde, cantam "Grândola, Vila Morena"\nGravado em Castro Verde, Beja, Alentejo (Baixo Alentejo)\n13 de Fevereiro de 2014';
    const regex = new RegExp(escapeRegExp(selectedStr), 'gi');
    const matches = getMatches(content, regex, selectedStr);

    const expectedMatches = [
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

    expect(matches).toEqual(expectedMatches);
});

test('Regression test to prevent bug where selecting a second mark at the end of the text wouldnt work', () => {
    const selectedStr = 'Leal';
    const content = '3 . Djonga - Leal';
    const regex = new RegExp(escapeRegExp(selectedStr), 'gi');
    const matches = getMatches(content, regex, selectedStr);

    const expectedMatches = [
        {
            start: 13,
            end: 16,
            content: 'Leal',
            type: 'mark',
        },
    ];

    expect(matches).toEqual(expectedMatches);
});
