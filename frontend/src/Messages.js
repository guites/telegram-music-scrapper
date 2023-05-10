import { useCallback, useEffect, useState } from 'react';
import {
    read_telegram_messages,
    sync_telegram_messages,
} from './requests';
import {
    getRangeById,
    onTextHighlighted,
} from './highlightable_functions';
import {
    Badge,
    Button,
    ButtonGroup,
    Container,
    Modal,
    Row,
    Table,
} from 'react-bootstrap';
import { Header, TooltipRenderer } from './components';
import ch00nky from './assets/ch00nky.gif';
import './App.css';
import Highlightable from 'highlightable';
import {
    resetHightlight,
    batchAddHighlight,
} from './highlightable_functions';

export const Messages = () => {
    const [selectedRow, setSelectedRow] = useState(null);
    const [artist, setArtist] = useState({
        query: null,
        options: null,
        loading: false,
    });
    const [popOver, setPopOver] = useState({});
    const [text, setText] = useState([
        {
            id: null,
            webpage_description: null,
            webpage_title: null,
            beforeText: null,
            selectedText: null,
            afterText: null,
        },
    ]);
    const [gettingMoreMessages, setGettingMoreMessages] = useState(false);

    const [showIsMusicModal, setShowIsMusicModal] = useState(false);
    const handleShowIsMusicModal = isMusic =>
        setShowIsMusicModal({
            ...findById(selectedRow),
            isMusic: isMusic,
        });
    const handleCloseIsMusicModal = () => setShowIsMusicModal(false);

    const findById = id => {
        return text.find(item => item.id === id);
    };

    const request_telegram_messages = useCallback(async () => {
        const telegram_messages = await read_telegram_messages(null);
        const initial_text = [];
        const batchRanges = [];
        telegram_messages.forEach((row, _) => {
            initial_text.push({
                id: row.id,
                message: row.message,
                site_name: row.site_name,
                webpage_url: row.webpage_url,
                webpage_description: row.webpage_description,
                webpage_title: row.webpage_title,
                beforeText: null,
                selectedText: null,
                afterText: null,
            });
            // if row has artists, set the ranges to be highlighted
            if (row.artists) {
                for (const artist of row.artists) {
                    // get start and end offset of artist name in row.webpage_title
                    const start = row.webpage_title.indexOf(artist.name);
                    const end = start + (artist.name.length - 1);
                    // add range to ranges
                    const range = {
                        start: start,
                        end: end,
                        text: row.webpage_title,
                        data: {
                            id: `title-${row.id}`,
                            artist: artist.name,
                            origin: 'automatic',
                        },
                    };
                    batchRanges.push(range);
                }
            }
        });
        batchAddHighlight(batchRanges, ranges, setRanges);
        setText(initial_text);
    }, []);

    const get_more_messages = async () => {
        setGettingMoreMessages(true);
        await sync_telegram_messages();

        // get item from text with biggest id
        let biggest_id_item;
        if (text.length === 0) {
            biggest_id_item = { id: null };
        } else {
            biggest_id_item = text.reduce((prev, current) =>
                prev.id > current.id ? prev : current,
            );
        }

        const telegram_messages = await read_telegram_messages(
            biggest_id_item.id,
        );
        // make a copy of the text array
        const new_text = [...text];
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
                    beforeText: null,
                    selectedText: null,
                    afterText: null,
                });
            }
        });
        setText(new_text);
        setGettingMoreMessages(false);
    };

    // fetch table data from backend
    useEffect(() => {
        request_telegram_messages();
    }, []);

    const handleOnTextHighlighted = range => {
        onTextHighlighted(range, ranges, setRanges);
    };

    const customRenderer = (
        currentRenderedNodes,
        currentRenderedRange,
        currentRenderedIndex,
        onMouseOverHighlightedWord,
    ) => {
        const handleCancelSelection = range => {
            resetHightlight(range, ranges, setRanges);
        };
        const handleConfirmSelection = range => {
            confirmSelection(range);
        };
        const handleRemoveSelection = range => {
            removeSelection(range);
        };

        return (
            <TooltipRenderer
                letterNodes={currentRenderedNodes}
                range={currentRenderedRange}
                rangeIndex={currentRenderedIndex}
                onMouseOverHighlightedWord={onMouseOverHighlightedWord}
                handleCancelSelection={handleCancelSelection}
                handleConfirmSelection={handleConfirmSelection}
                handleRemoveSelection={handleRemoveSelection}
            />
        );
    };

    const removeSelection = async range => {
        const telegram_message_id = range.data.id
            .replace('title-', '')
            .replace('description-', '');
        // TODO: should be a DELETE request
        // TODO: should access artist_id from range.data
        console.log('removin!');
    };

    const confirmSelection = async range => {
        // get substring from range based on start and end props
        const selectedText = range.text.substring(
            range.start,
            range.end + 1,
        );
        const telegram_message_id = range.data.id
            .replace('title-', '')
            .replace('description-', '');
        console.log(
            `Matching artist ${selectedText} to message ${selectedText}`,
        );
        const request = await fetch(
            `http://localhost:8000/telegram_messages/${telegram_message_id}/artist`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artist_name: selectedText,
                }),
            },
        );
        const response = await request.json();
        // TODO: should save artist_id in range.data
    };

    const setIsMusicFlag = async (telegram_message_id, is_music) => {
        const request = await fetch(
            `http://localhost:8000/telegram_messages/${telegram_message_id}?is_music=${is_music}`,
            { method: 'PATCH' },
        );
        const response = await request.json();
        console.log(response);

        // TODO: handle errors
        setText(text.filter(item => item.id !== telegram_message_id));
        setPopOver({ id: null });
        setShowIsMusicModal(false);
    };

    const setIsMusicModal = (
        <Modal
            show={showIsMusicModal != null}
            onHide={handleCloseIsMusicModal}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {showIsMusicModal.id} |{' '}
                    {showIsMusicModal.isMusic
                        ? 'Marcou todos os artistas?'
                        : 'Este vídeo não é de música?'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    <a href={showIsMusicModal.webpage_url} target="_blank">
                        {showIsMusicModal?.webpage_title}
                    </a>
                </p>
                <p
                    style={{
                        maxHeight: '300px',
                        overflowY: 'scroll',
                        whiteSpace: 'pre-line',
                    }}
                >
                    {showIsMusicModal?.webpage_description}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleCloseIsMusicModal}
                >
                    Fechar
                </Button>
                <Button
                    variant={
                        showIsMusicModal.isMusic ? 'success' : 'danger'
                    }
                    onClick={() =>
                        setIsMusicFlag(
                            showIsMusicModal.id,
                            showIsMusicModal.isMusic,
                        )
                    }
                >
                    {showIsMusicModal.isMusic ? 'Marquei' : 'Não é música'}
                </Button>
            </Modal.Footer>
        </Modal>
    );

    const [ranges, setRanges] = useState([]);

    return (
        <>
            <Header />
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
                        Ajude a marcar artistas e bandas nos vídeos
                        listados abaixo!
                        <br />
                        <br />
                        ❓Para marcar, selecione o texto com o mouse.
                        <br />
                        <br />✅ Não esqueça de marcar os vídeos como
                        concluídos!
                        <br />
                        <br />❌ Sinalize vídeos que não são de música.
                    </p>
                    <p></p>
                    <p></p>
                </Row>
                <Row>
                    <Table size="sm" striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>URL do vídeo</th>
                                <th>Título</th>
                                <th>Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            {text.map((row, index) => (
                                <tr className="float-anchor" key={row.id}>
                                    <td>{row.id}</td>
                                    <td>{row.message}</td>
                                    <td className="webpage_title">
                                        <Highlightable
                                            ranges={getRangeById(
                                                ranges,
                                                `title-${row.id}`,
                                            )}
                                            enabled={true}
                                            style={{ textAlign: 'left' }}
                                            onTextHighlighted={
                                                handleOnTextHighlighted
                                            }
                                            id={`title-${row.id}`}
                                            highlightStyle={{
                                                backgroundColor: '#ffcc80',
                                            }}
                                            rangeRenderer={customRenderer}
                                            text={row.webpage_title ?? ''}
                                        />
                                    </td>
                                    <td className="webpage_description">
                                        <Highlightable
                                            ranges={getRangeById(
                                                ranges,
                                                `descr-${row.id}`,
                                            )}
                                            enabled={true}
                                            onTextHighlighted={
                                                onTextHighlighted
                                            }
                                            id={`descr-${row.id}`}
                                            highlightStyle={{
                                                backgroundColor: '#ffcc80',
                                            }}
                                            text={
                                                row.webpage_description ??
                                                ''
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                            {/* <tr className="float-anchor">
              <td>
                1
              </td>
              <td>https://youtu.be/GBe5KoLYepk</td>
              <td className="webpage_title">
                <Highlightable ranges={getRangeById('vid-descr-1')}
                enabled={true}
                onTextHighlighted={onTextHighlighted}
                id={'vid-descr-1'}
                highlightStyle={{
                  backgroundColor: '#ffcc80'
                }}
                text={"Rael - Passiflora part. Céu, RDD e Ailton Krenak"}  
              />  
              </td>
            </tr> */}
                        </tbody>
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
        </>
    );
};

export default Messages;
