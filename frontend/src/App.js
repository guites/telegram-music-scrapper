import { useCallback, useEffect, useState } from 'react';
import {
    read_telegram_messages,
    sync_telegram_messages,
} from './requests';
import {
    Badge,
    Button,
    ButtonGroup,
    Container,
    Form,
    Modal,
    OverlayTrigger,
    Popover,
    Row,
    Table,
    Tooltip,
} from 'react-bootstrap';
import { Header } from './components/Header';
import ch00nky from './assets/ch00nky.gif';
import './App.css';

export const App = () => {
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
        });
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
        console.log(response);
        setArtist({ ...artist, loading: false });
        if (request.ok) {
            // setText(text.filter((item) => item.id !== currentText.id));
            setPopOver({ id: null });
        }
    };

    const selectedArtistPopover = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Confirme o artista</Popover.Header>
            <Popover.Body>
                <div>
                    <strong>{popOver.selectedText}</strong>
                </div>
                <hr />
                <Row>
                    <Form>
                        <Button
                            onClick={() =>
                                confirmArtist(popOver.selectedText)
                            }
                            variant="primary"
                            size="sm"
                            disabled={artist.loading}
                        >
                            Confirmar
                        </Button>
                    </Form>
                </Row>
            </Popover.Body>
        </Popover>
    );

    const renderWithMarks = (id, text) => {
        if (!text) return;

        if (id === popOver.id) {
            const regex = new RegExp(popOver.selectedText, 'gi');

            // save the index of each match in the original text
            const indexPairs = [];
            let matchArr = null;
            while (null != (matchArr = regex.exec(text))) {
                indexPairs.push([matchArr.index, regex.lastIndex]);
            }

            if (indexPairs.length === 0) {
                return <div>{text}</div>;
            }

            const renderedText = [];
            // push the text before the first match
            renderedText.push(text.substring(0, indexPairs[0][0]));
            for (const [i, pair] of indexPairs.entries()) {
                // push the text between the latest match and the beggining of the current match

                if (i > 0) {
                    renderedText.push(
                        text.substring(indexPairs[i - 1][1], pair[0]),
                    );
                }

                // if the index matches the index of the selected text, substitute with the popover using the overlay trigger
                if (pair[0] === popOver.textIndex) {
                    renderedText.push(
                        <OverlayTrigger
                            show={popOver.id !== null}
                            placement="right"
                            overlay={selectedArtistPopover}
                        >
                            <mark>{popOver.selectedText}</mark>
                        </OverlayTrigger>,
                    );
                } else {
                    renderedText.push(
                        <mark>{text.substring(pair[0], pair[1])}</mark>,
                    );
                }
            }
            // push the text after the last match
            renderedText.push(
                text.substring(indexPairs[indexPairs.length - 1][1]),
            );
            return renderedText;
        }

        return text;
    };

    const handleMouseUp = async e => {
        const windowSelection = window.getSelection();
        const selectedStr = windowSelection.toString();
        const currentText = findById(selectedRow);

        // check if target is inside the popover
        const popoverElement = document.getElementById('popover-basic');
        if (popoverElement && !popoverElement.contains(e.target)) {
            // if user clicked outside of the popover, close it
            setPopOver({ id: null });
        }

        if (selectedStr && selectedStr.length > 0 && currentText) {
            // get element wrapping the selection
            const selectedElement =
                windowSelection.focusNode.parentElement;

            const elClassName = selectedElement.parentElement.className;

            // only allow selection inside webpage_description and webpage_title
            if (
                !['webpage_description', 'webpage_title'].includes(
                    elClassName,
                )
            ) {
                return;
            }

            const popOverInTitle = elClassName === 'webpage_title';

            setArtist({ ...artist });
            let index;
            if (popOverInTitle) {
                index = currentText.webpage_title.indexOf(selectedStr);
                currentText.selectedText = selectedStr;
                currentText.beforeText =
                    currentText.webpage_title.substring(0, index);
                currentText.afterText =
                    currentText.webpage_title.substring(
                        index + selectedStr.length,
                    );
            } else {
                index =
                    currentText.webpage_description.indexOf(selectedStr);
                currentText.selectedText = selectedStr;
                currentText.beforeText =
                    currentText.webpage_description.substring(0, index);
                currentText.afterText =
                    currentText.webpage_description.substring(
                        index + selectedStr.length,
                    );
            }

            // show popover
            setPopOver({
                ...currentText,
                inTitle: popOverInTitle,
                textIndex: index,
            });

            // update text with new currentText
            setText(
                text.map(item =>
                    item.id === currentText.id ? currentText : item,
                ),
            );
        }
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
                        Ajude a encontrar nomes de artistas ou bandas no
                        título e descrição dos vídeos listados abaixo!
                        <br />
                        <br />
                        ❓Para marcar um artista ou banda, selecione o
                        texto com o mouse e confirme no popover.
                        <br />
                        <br />✅ Marque os vídeos como concluídos após
                        achar todas as bandas e artistas.
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
                                <th>Mensagem</th>
                                <th>Título</th>
                                <th>Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            {text.map((row, index) => (
                                <tr
                                    id={`row-${row.id}`}
                                    className="float-anchor"
                                    key={row.id}
                                    onMouseUp={handleMouseUp}
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
                                                        <strong>
                                                            não
                                                        </strong>{' '}
                                                        é de música.
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
                                                            todos os
                                                            artistas
                                                        </strong>{' '}
                                                        na descrição e
                                                        título da página.
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
                                        {showIsMusicModal &&
                                            setIsMusicModal}
                                    </td>
                                    <td>{row.message}</td>
                                    <td className="webpage_title">
                                        <div>
                                            {renderWithMarks(
                                                row.id,
                                                row.webpage_title,
                                            )}
                                        </div>
                                    </td>
                                    <td className="webpage_description">
                                        <div>
                                            {renderWithMarks(
                                                row.id,
                                                row.webpage_description,
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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

export default App;
