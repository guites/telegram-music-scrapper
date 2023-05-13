import {
    Accordion,
    Badge,
    Button,
    Card,
    Container,
    Form,
    ListGroup,
    ListGroupItem,
    Offcanvas,
    Row,
} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import {
    read_registered_artists,
    read_musicbrainz_suggestions,
} from './requests';
import { Header } from './components/Header';
import { DeleteArtistModal } from './components/DeleteArtistModal';
import f00nky from './f00nky.gif';
import './Artists.css';
import { ArtistMusicBrainzSuggestionInfo } from './components/ArtistMusicBrainzSuggestionInfo';

export const Artists = () => {
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [artists, setArtists] = useState([]);
    const [totalMsgs, setTotalMsgs] = useState(0);
    const [countRange, setCountRange] = useState([0, 0]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const getMessageCountRange = artists_list => {
        let totalMessages = 0;
        const counts = artists_list.map(artist => {
            const qtt = artist.telegram_messages.length;
            totalMessages += qtt;
            return qtt;
        });
        const min = Math.min(...counts);
        const max = Math.max(...counts);
        return [min, max, totalMessages];
    };

    const badgeColorCode = count => {
        // split the count range in 10 partss
        const range = countRange[1] - countRange[0];
        const step = range / 10;
        const index = Math.floor((count - countRange[0]) / step);
        if (index > 9) {
            return 'bg-9';
        }
        return `bg-${index}`;
    };

    const get_telegram_message_artists = async () => {
        const json_artists = await read_registered_artists();

        const [min, max, totalMessages] =
            getMessageCountRange(json_artists);
        setCountRange([min, max]);
        setTotalMsgs(totalMessages);

        setArtists(json_artists);
    };

    useEffect(() => {
        get_telegram_message_artists();
    }, []);

    const getMusicBrainzSuggestions = async artist => {
        const suggestions = await read_musicbrainz_suggestions(artist.id);

        const video_urls = [];
        for (let i = 0; i < artist.telegram_messages.length; i++) {
            const telegram_message = artist.telegram_messages[i];
            video_urls.push({
                id: telegram_message.id,
                title: telegram_message.webpage_title,
                url: telegram_message.webpage_url,
            });
        }

        setSelectedArtist({ ...artist, suggestions, video_urls });
        if (suggestions.length > 0) {
            setSelectedSuggestion(suggestions[0]);
        } else {
            setSelectedSuggestion(null);
        }
    };

    const getSuggestionOptions = suggestions => {
        return suggestions.map((suggestion, idx) => {
            return (
                <option key={suggestion.mbid} value={idx}>
                    {suggestion.name} ({suggestion.score}%)
                </option>
            );
        });
    };

    const getScoreTag = score => {
        if (score > 80) {
            return <Badge bg="success">{score}%</Badge>;
        }
        if (score > 50) {
            return <Badge bg="warning">{score}%</Badge>;
        }
        return <Badge bg="danger">{score}%</Badge>;
    };

    const removeArtist = async artist => {
        console.log(artist);
        // TODO: remove artist from database and update the artists list
    };

    return (
        <>
            <Header />
            <DeleteArtistModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleDelete={() => removeArtist(selectedArtist)}
                artist={selectedArtist}
            />
            <Container>
                <h1>Artists and Bands</h1>
                <img
                    style={{ maxWidth: '300px', float: 'left' }}
                    src={f00nky}
                    alt="Funky Kong"
                />
                <Card>
                    <Card.Body>
                        Showing{' '}
                        <Badge bg="primary">{artists.length}</Badge>{' '}
                        artists and bands from{' '}
                        <Badge bg="primary">{totalMsgs}</Badge> telegram
                        messages.
                    </Card.Body>
                </Card>
                {artists.map(artist => {
                    return (
                        <Button
                            onClick={() =>
                                getMusicBrainzSuggestions(artist)
                            }
                            className="m-1"
                            variant="light"
                            key={artist.id}
                        >
                            {artist.name}{' '}
                            <Badge
                                className={badgeColorCode(
                                    artist.telegram_messages.length,
                                )}
                            >
                                {artist.telegram_messages.length}
                            </Badge>
                        </Button>
                    );
                })}
            </Container>
            <Offcanvas
                show={selectedArtist !== null}
                onHide={() => setSelectedArtist(null)}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>
                        {selectedArtist?.name}
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                Videos by {selectedArtist?.name}
                            </Accordion.Header>
                            <Accordion.Body>
                                <ListGroup variant="flush">
                                    {selectedArtist?.video_urls.map(
                                        (vid, idx) => {
                                            return (
                                                <ListGroupItem
                                                    key={`li-gr-${idx}`}
                                                >
                                                    <Button
                                                        className="ta-left"
                                                        variant="link"
                                                        target="_blank"
                                                        href={vid.url}
                                                    >
                                                        {vid.title}
                                                    </Button>
                                                </ListGroupItem>
                                            );
                                        },
                                    )}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>
                                Configure artist
                            </Accordion.Header>
                            <Accordion.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Suggestions</Form.Label>
                                    <Form.Control
                                        as="select"
                                        onChange={e =>
                                            setSelectedSuggestion(
                                                selectedArtist.suggestions[
                                                    e.target.value
                                                ],
                                            )
                                        }
                                    >
                                        {selectedArtist
                                            ? getSuggestionOptions(
                                                  selectedArtist.suggestions,
                                              )
                                            : null}
                                    </Form.Control>
                                </Form.Group>
                                <Container>
                                    <Row>
                                        <div style={{ display: 'flex' }}>
                                            <h2>
                                                {selectedSuggestion?.name}
                                            </h2>
                                            &nbsp;
                                            <small>
                                                {getScoreTag(
                                                    selectedSuggestion?.score,
                                                )}
                                            </small>
                                        </div>
                                    </Row>
                                    {
                                        <ArtistMusicBrainzSuggestionInfo
                                            suggestion={selectedSuggestion}
                                            onConfirmArtist={updatedSuggestion =>
                                                setSelectedSuggestion(
                                                    updatedSuggestion,
                                                )
                                            }
                                        />
                                    }
                                </Container>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>
                                Remove artist
                            </Accordion.Header>
                            <Accordion.Body>
                                <Button
                                    variant="danger"
                                    onClick={() =>
                                        setShowDeleteModal(true)
                                    }
                                >
                                    Remove artist
                                </Button>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};
