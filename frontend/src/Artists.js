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
    read_telegram_message,
    read_artists_positions_by_openstreet,
} from './requests';
import { Header } from './components/Header';
import f00nky from './f00nky.gif';
import './Artists.css';

export const Artists = () => {
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [artists, setArtists] = useState([]);
    const [totalMsgs, setTotalMsgs] = useState(0);
    const [countRange, setCountRange] = useState([0, 0]);

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

    const getSuggestionLiStacked = (label, value, key) => {
        return (
            <ListGroup.Item key={key}>
                <div>
                    <div className="fw-bold">
                        <small>{label}</small>
                    </div>
                    <small>{value}</small>
                </div>
            </ListGroup.Item>
        );
    };

    const getSuggestionLi = (label, value, key) => {
        return (
            <ListGroup.Item key={key}>
                <small>
                    <strong>{label}</strong>: {value}
                </small>
            </ListGroup.Item>
        );
    };

    const confirmArtist = async suggestion => {
        if (suggestion['area-name'] || suggestion['begin-area-name']) {
            const beginArea = suggestion['begin-area-name'] ?? '';
            const areaName = suggestion['area-name'] ?? '';
            const position = await read_artists_positions_by_openstreet(
                areaName,
                beginArea,
            );
            if (position.length > 0) {
                const lat = position[0]['lat'];
                const lon = position[0]['lon'];

                const coordinates = {
                    lat,
                    lon,
                };
                setSelectedSuggestion({
                    ...selectedSuggestion,
                    coordinates,
                });
            }
        }
    };

    const getSuggestionInfo = suggestion => {
        if (!suggestion) {
            return null;
        }
        const suggestionEls = [];
        suggestionEls.push(
            getSuggestionLiStacked(
                'MusicBrainz id',
                suggestion['mbid'],
                `${suggestion['mbid']}-0`,
            ),
        );
        suggestionEls.push(
            getSuggestionLiStacked(
                'Name',
                suggestion['name'],
                `${suggestion['mbid']}-1`,
            ),
        );
        suggestionEls.push(
            getSuggestionLi(
                'Score',
                suggestion['score'],
                `${suggestion['mbid']}-2`,
            ),
        );
        suggestionEls.push(
            getSuggestionLi(
                'Ended',
                suggestion['life-span-ended'],
                `${suggestion['mbid']}-3`,
            ),
        );

        if (suggestion['type']) {
            suggestionEls.push(
                getSuggestionLi(
                    'Type',
                    suggestion['type'],
                    `${suggestion['mbid']}-4`,
                ),
            );
        }

        if (suggestion['area-name']) {
            suggestionEls.push(
                getSuggestionLi(
                    'Area',
                    suggestion['area-name'],
                    `${suggestion['mbid']}-5`,
                ),
            );
        }

        if (suggestion['country']) {
            suggestionEls.push(
                getSuggestionLi(
                    'Country',
                    suggestion['country'],
                    `${suggestion['mbid']}-6`,
                ),
            );
        }

        if (suggestion['life-span-begin']) {
            suggestionEls.push(
                getSuggestionLi(
                    'Life span begin',
                    suggestion['life-span-begin'],
                    `${suggestion['mbid']}-7`,
                ),
            );
        }

        if (suggestion['life-span-end']) {
            suggestionEls.push(
                getSuggestionLi(
                    'Life span end',
                    suggestion['life-span-end'],
                    `${suggestion['mbid']}-8`,
                ),
            );
        }

        if (suggestion['begin-area-name']) {
            suggestionEls.push(
                getSuggestionLi(
                    'Begin area',
                    suggestion['begin-area-name'],
                    `${suggestion['mbid']}-9`,
                ),
            );
        }

        if (suggestion['disambiguation']) {
            suggestionEls.push(
                getSuggestionLi(
                    'Disambiguation',
                    suggestion['disambiguation'],
                    `${suggestion['mbid']}-10`,
                ),
            );
        }

        if (suggestion['coordinates']) {
            const previewUrl = `https://maps.google.com/?q=${suggestion['coordinates']['lat']},${suggestion['coordinates']['lon']}`;
            suggestionEls.push(
                getSuggestionLi(
                    'Preview coordinates',
                    previewUrl,
                    `${suggestion['mbid']}-11`,
                ),
            );
        }

        suggestionEls.push(
            <Button
                key={`${suggestion['mbid']}-12`}
                onClick={() => confirmArtist(suggestion)}
            >
                Confirm artist
            </Button>,
        );

        return <ListGroup variant="flush">{suggestionEls}</ListGroup>;
    };

    return (
        <>
            <Header />
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
                                    {getSuggestionInfo(selectedSuggestion)}
                                </Container>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};
