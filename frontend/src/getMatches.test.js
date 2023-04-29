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

test('Matches are generated correctly for string with tildes', () => {
    const selectedStr = 'Vietnã';
    const content = 'Vietnã - Front | ft. Nocivo Shomon | Prod. Vietnã';
    
    // normalize two character strings into one
    // source: https://mathiasbynens.be/notes/javascript-unicode
    const content2 = 'Vietnã - Front | ft. Nocivo Shomon | Prod. Vietnã'.normalize('NFC');
    expect(content).toEqual(content2);
    
    const regex = new RegExp(escapeRegExp(selectedStr), 'gi');
    const matches = getMatches(content, regex, selectedStr);

    const expectedMatches = [
        {
            start: 0,
            end: 5,
            content: 'Vietnã',
            type: 'mark',
        },
        {
            start: 43,
            end: 48,
            content: 'Vietnã',
            type: 'mark',
        },
    ];

    expect(matches).toEqual(expectedMatches);
})
