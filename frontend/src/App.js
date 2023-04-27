import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, ButtonGroup } from 'react-bootstrap';
import { Col, Container } from 'react-bootstrap';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Row from 'react-bootstrap/Row';
import { Table, Tooltip } from 'react-bootstrap';

import './App.css';
import ch00nky from './ch00nky.gif';
import escapeRegExp from './escapeRegex';
import ParsedBlock from './components/parsedBlock';
import SetIsMusicModal from './components/isMusicModal';
import SelectedArtistPopover from './components/selectedArtistPopOver';
import {
    read_telegram_messages,
    sync_telegram_messages,
} from './requests';

export const App = () => {
    const [selectedRow, setSelectedRow] = useState(null);
    const [artist, setArtist] = useState({
        query: null,
        options: null,
        loading: false,
    });
    const [popOver, setPopOver] = useState({});
    const [rows, setRows] = useState([
        {
            id: null,
            webpage_description: null,
            webpage_title: null,
            selectedText: null,
            parsed_description: null,
            parsed_title: null,
        },
    ]);
    const [gettingMoreMessages, setGettingMoreMessages] = useState(false);

    const [showIsMusicModal, setShowIsMusicModal] = useState(false);
    const handleShowIsMusicModal = isMusic => {
        console.log(isMusic, selectedRow, findById(selectedRow));
        setShowIsMusicModal({
            ...findById(selectedRow),
            isMusic: isMusic,
        });
    };

    const handleCloseIsMusicModal = () => setShowIsMusicModal(false);

    const findById = id => {
        return rows.find(item => item.id === id);
    };

    const setIsMusicFlag = async (telegram_message_id, is_music) => {
        const request = await fetch(
            `http://localhost:8000/telegram_messages/${telegram_message_id}?is_music=${is_music}`,
            { method: 'PATCH' },
        );

        // TODO: handle errors
        const response = await request.json();

        setRows(rows.filter(item => item.id !== telegram_message_id));
        setPopOver({ id: null });
        setShowIsMusicModal(false);
    };

    const createStructFromMatches = (matches, content) => {
        const struct = [];
        let lastEnd = 0;
        matches.forEach(match => {
            if (match.start > lastEnd) {
                struct.push({
                    start: lastEnd,
                    end: match.start,
                    content: content.substring(lastEnd, match.start),
                    type: 'string',
                });
            }
            struct.push({
                start: match.start,
                end: match.end,
                content: content.substring(match.start, match.end),
                type: 'mark',
            });
            lastEnd = match.end;
        });
        if (lastEnd < content.length) {
            struct.push({
                start: lastEnd,
                end: content.length,
                content: content.substring(lastEnd, content.length),
                type: 'string',
            });
        }
        return struct;
    };

    const createStructFromSuggestions = (suggestions, content) => {
        const struct = [];
        let lastEnd = 0;
        suggestions.forEach(suggestion => {
            console.log(suggestion);
            if (suggestion[0] > lastEnd) {
                struct.push({
                    start: lastEnd,
                    end: suggestion[0],
                    content: content.substring(lastEnd, suggestion[0]),
                    type: 'string',
                });
            }
            struct.push({
                start: suggestion[0],
                end: suggestion[1] - 1, // -1 because the on the api the end is exclusive, i.e. up to but not including the end index
                content: content.substring(suggestion[0], suggestion[1]),
                type: 'suggestion',
            });
            lastEnd = suggestion[1];
        });
        if (lastEnd < content.length) {
            struct.push({
                start: lastEnd,
                end: content.length,
                content: content.substring(lastEnd, content.length),
                type: 'string',
            });
        }
        return struct;
    };

    const newGetSuggestions = async () => {
        const request = await fetch(
            `http://localhost:8000/telegram_messages/suggestions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rows.map(item => parseInt(item.id))),
            },
        );
        const response = await request.json();

        // loop over the response and update the text array
        const new_rows = [...rows];
        response.forEach((row, _) => {
            // if row has no suggestions, return
            if (
                !row.suggestions ||
                !row.suggestions['webpage_title'] ||
                row.suggestions['webpage_title'].length === 0
            )
                return;
            const title_suggestions = row.suggestions['webpage_title'];

            const new_row = new_rows.findIndex(item => item.id === row.id);
            new_rows[new_row].parsed_title = createStructFromSuggestions(
                title_suggestions,
                row.webpage_title,
            );
        });
        setRows(new_rows);
    };

    const request_telegram_messages = useCallback(async () => {
        const telegram_messages = await read_telegram_messages(null);
        const initial_text = [];
        telegram_messages.forEach((row, _) => {
            initial_text.push({
                id: row.id,
                message: row.message,
                site_name: row.site_name,
                webpage_url: row.webpage_url,
                webpage_description: row.webpage_description,
                webpage_title: row.webpage_title,
                parsed_title: createStructFromSuggestions(
                    [],
                    row.webpage_title,
                ),
                parsed_description: createStructFromSuggestions(
                    [],
                    row.webpage_description,
                ),
                selectedText: null,
            });
        });
        setRows(initial_text);
    }, []);

    const get_more_messages = async () => {
        setGettingMoreMessages(true);
        await sync_telegram_messages();

        // get item from text with biggest id
        let biggest_id_item;
        if (rows.length === 0) {
            biggest_id_item = { id: null };
        } else {
            biggest_id_item = rows.reduce((prev, current) =>
                prev.id > current.id ? prev : current,
            );
        }

        const telegram_messages = await read_telegram_messages(
            biggest_id_item.id,
        );
        // make a copy of the text array
        const new_text = [...rows];
        // add new messages to the copy
        telegram_messages.forEach((row, _) => {
            if (row.id > biggest_id_item.id) {
                new_text.push({
                    id: row.id,
                    message: row.message,
                    site_name: row.site_name,
                    webpage_url: row.webpage_url,
                    webpage_description: row.webpage_description,
                    webpage_title: row.webpage_title,
                    parsed_title: createStructFromSuggestions(
                        [],
                        row.webpage_title,
                    ),
                    parsed_description: createStructFromSuggestions(
                        [],
                        row.webpage_description,
                    ),
                    selectedText: null,
                });
            }
        });
        setRows(new_text);
        setGettingMoreMessages(false);
    };

    // fetch table data from backend
    useEffect(() => {
        request_telegram_messages();
    }, [request_telegram_messages]);

    const confirmArtist = async artist_name => {
        const currentText = findById(selectedRow);
        setArtist({ ...artist, loading: true });
        const request = await fetch(
            `http://localhost:8000/telegram_messages/${currentText.id}/artist`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artist_name: artist_name,
                }),
            },
        );
        const response = await request.json();
        setArtist({ ...artist, loading: false });
        if (request.ok) {
            // setText(text.filter((item) => item.id !== currentText.id));
            setPopOver({ id: null });
        }
    };

    const createMarkStructure = content => {
        if (typeof content === 'string') {
            return {
                content: content,
                structure: [
                    {
                        start: 0,
                        end: content.length,
                        content: content,
                        type: 'string',
                    },
                ],
            };
        }

        let stringContent = '',
            children = null;
        const indexes = [];

        for (const [i, el] of content.entries()) {
            if (typeof el === 'string') {
                indexes.push({
                    start: i === 0 ? 0 : indexes[i - 1].end,
                    end:
                        i === 0
                            ? el.length
                            : indexes[i - 1].end + el.length,
                    content: el,
                    type: 'string',
                });
                stringContent = stringContent + el;
                continue;
            }

            children = el.props.children;
            if (
                typeof children !== 'string' &&
                children.hasOwnProperty('props')
            ) {
                children = children.props.children;
            }
            indexes.push({
                start: i === 0 ? 0 : indexes[i - 1].end,
                end:
                    i === 0
                        ? children.length
                        : indexes[i - 1].end + children.length,
                content: children,
                type: 'mark',
            });
            stringContent = stringContent + el.props.children;
        }

        return {
            content: stringContent,
            structure: indexes,
        };
    };

    const renderWithMarks = (row, type) => {
        if (!row) return;

        const id = row.id;
        const text = row[type];

        if (!text) return;

        const indexPairs = [];
        let matchArr = null;

        if (id === popOver.id) {
            // get the raw text and the indexes of existing marks, in case the text has been
            // processed by another function
            const { content: stringText, structure: prevIndexes } =
                createMarkStructure(text);

            // if (type === 'webpage_title') {
            //     console.log('prevIndexes', prevIndexes);
            //     console.log('stringText', stringText);
            // }

            const regex = new RegExp(
                escapeRegExp(popOver.selectedText),
                'gi',
            );
            matchArr = null;
            while (null != (matchArr = regex.exec(stringText))) {
                indexPairs.push([matchArr.index, regex.lastIndex]);
            }

            if (indexPairs.length === 0) {
                return <div>{text}</div>;
            }

            const renderedText = [];
            // push the text before the first match, if there is any
            if (indexPairs[0][0] > 0) {
                renderedText.push(
                    stringText.substring(0, indexPairs[0][0]),
                );
            }
            for (const [i, pair] of indexPairs.entries()) {
                // push the text between the latest match and the beggining of the current match

                if (i > 0) {
                    renderedText.push(
                        stringText.substring(
                            indexPairs[i - 1][1],
                            pair[0],
                        ),
                    );
                }

                // if the index matches the index of the selected text, substitute with the popover using the overlay trigger
                if (pair[0] === popOver.textIndex) {
                    renderedText.push(
                        <OverlayTrigger
                            show={popOver.id !== null}
                            placement="right"
                            overlay={
                                <SelectedArtistPopover
                                    popOver={popOver}
                                    loading={artist.loading}
                                    confirmArtist={confirmArtist}
                                />
                            }
                        >
                            <mark>{popOver.selectedText}</mark>
                        </OverlayTrigger>,
                    );
                } else {
                    renderedText.push(
                        <mark>
                            {stringText.substring(pair[0], pair[1])}
                        </mark>,
                    );
                }
            }
            // push the text after the last match
            renderedText.push(
                stringText.substring(indexPairs[indexPairs.length - 1][1]),
            );

            const { structure: newIndexes } =
                createMarkStructure(renderedText);

            // if (type === 'webpage_title') {
            //     console.log('newIndexes', newIndexes);
            // }
            return renderedText;
        }

        return text;
    };

    const handleMouseUp = (e, row_id) => {
        const windowSelection = window.getSelection();
        const selectedStr = windowSelection.toString();
        const currentRow = findById(row_id);
        if (!currentRow) return;

        // TODO: we should be able to do this without getElementById
        // check if target is inside the popover
        const popoverElement = document.getElementById('popover-basic');
        if (popoverElement && !popoverElement.contains(e.target)) {
            // if user clicked outside of the popover, close it
            setPopOver({ id: null });
        }

        if (selectedStr && selectedStr.length > 0 && currentRow) {
            // get element wrapping the selection
            const selectedElement =
                windowSelection.focusNode.parentElement;

            const elClassName = selectedElement.parentElement.className;

            const popOverInTitle = elClassName === 'webpage_title';

            setArtist({ ...artist });

            const index = popOverInTitle
                ? currentRow.webpage_title.indexOf(selectedStr)
                : currentRow.webpage_description.indexOf(selectedStr);
            const content = popOverInTitle
                ? currentRow.webpage_title
                : currentRow.webpage_description;

            const selection = [];
            const regex = new RegExp(escapeRegExp(selectedStr), 'gi');

            let matchArr = null;
            while (null != (matchArr = regex.exec(content))) {
                console.log(matchArr.index, regex.lastIndex);
                selection.push({
                    start: matchArr.index,
                    end: regex.lastIndex,
                    content: selectedStr,
                    type: 'mark',
                });
            }

            const newStructure = createStructFromMatches(
                selection,
                content,
            );

            currentRow[
                popOverInTitle ? 'parsed_title' : 'parsed_description'
            ] = newStructure;

            // show popover
            setPopOver({
                ...currentRow,
                inTitle: popOverInTitle,
                textIndex: index,
            });
            console.log(newStructure);
            // update text with new currentText
            setRows(
                rows.map(item =>
                    item.id === currentRow.id ? currentRow : item,
                ),
            );
        }
    };

    return (
        <Container>
            <Row>
                <div style={{ display: 'flex' }}>
                    <h1>Band Hunter</h1>&nbsp;
                    <small>
                        <Badge bg="secondary">alpha</Badge>
                    </small>
                </div>
                <p>
                    <img
                        style={{ maxWidth: '300px', float: 'left' }}
                        src={ch00nky}
                        alt="Chunky Kong"
                    />
                    Ajude a encontrar nomes de artistas ou bandas no título
                    e descrição dos vídeos listados abaixo!
                    <br />
                    <br />
                    ❓Para marcar um artista ou banda, selecione o texto
                    com o mouse e confirme no popover.
                    <br />
                    <br />
                    Palavras <mark>grifadas em amarelo</mark> representam
                    marcações feitas pelo usuário.
                    <br />
                    Palavras{' '}
                    <mark className="nlp-suggestion">
                        grifadas em vermelho
                    </mark>{' '}
                    são sugestões do sistema.
                    <br />
                    <br />
                    ❗Clique nas sugestões do sistema para aceitá-las ou
                    recusá-las.
                </p>
                <p>
                    ✅ Marque os vídeos como concluídos após achar todas as
                    bandas e artistas.
                </p>
                <p>❌ Sinalize vídeos que não são de música.</p>
                <p></p>
            </Row>
            <Row>
                <Col>
                    <Button onClick={() => newGetSuggestions()}>
                        Ver sugestões
                    </Button>
                </Col>
            </Row>
            <Row>
                <Table size="sm" striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Mensagem</th>
                            <th>Título</th>
                            <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr
                                id={`row-${row.id}`}
                                className="float-anchor"
                                key={row.id}
                                onMouseUp={e => handleMouseUp(e, row.id)}
                                onMouseEnter={() => {
                                    setSelectedRow(row.id);
                                }} /* onMouseLeave={() => { setSelectedRow(null) }} */
                            >
                                <td>
                                    {row.id}
                                    <ButtonGroup
                                        className={`floating-group ${
                                            selectedRow === row.id
                                                ? 'visible'
                                                : ''
                                        }`}
                                        aria-label="Basic example"
                                    >
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip
                                                    id={`tooltip-top`}
                                                >
                                                    Vídeo{' '}
                                                    <strong>não</strong> é
                                                    de música.
                                                </Tooltip>
                                            }
                                        >
                                            <Button
                                                onClick={() =>
                                                    handleShowIsMusicModal(
                                                        false,
                                                    )
                                                }
                                                size="sm"
                                                variant="danger"
                                            >
                                                ✕
                                            </Button>
                                        </OverlayTrigger>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip
                                                    id={`tooltip-top`}
                                                >
                                                    Já marquei{' '}
                                                    <strong>
                                                        todos os artistas
                                                    </strong>{' '}
                                                    na descrição e título
                                                    da página.
                                                </Tooltip>
                                            }
                                        >
                                            <Button
                                                onClick={() =>
                                                    handleShowIsMusicModal(
                                                        true,
                                                    )
                                                }
                                                size="sm"
                                                variant="success"
                                            >
                                                ✓
                                            </Button>
                                        </OverlayTrigger>
                                    </ButtonGroup>
                                    <SetIsMusicModal
                                        showIsMusicModal={showIsMusicModal}
                                        handleCloseIsMusicModal={
                                            handleCloseIsMusicModal
                                        }
                                        setIsMusicFlag={setIsMusicFlag}
                                    />
                                </td>
                                <td>{row.message}</td>
                                <td className="webpage_title">
                                    <div>
                                        {row.parsed_title?.map(
                                            (ex, id) => (
                                                <ParsedBlock
                                                    key={id}
                                                    type={ex.type}
                                                    content={ex.content}
                                                />
                                            ),
                                        )}
                                    </div>
                                </td>
                                <td className="webpage_description">
                                    <div>
                                        {row.parsed_description?.map(
                                            (ex, id) => (
                                                <ParsedBlock
                                                    key={id}
                                                    type={ex.type}
                                                    content={ex.content}
                                                />
                                            ),
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {/* expected.map((ex) => {<TestComp type={ex.type}>{ex.content}</TestComp>) */}
                </Table>
            </Row>
            <ButtonGroup>
                <Button
                    disabled={gettingMoreMessages}
                    onClick={get_more_messages}
                >
                    Mais mensagens
                </Button>
            </ButtonGroup>
        </Container>
    );
};

export default App;
