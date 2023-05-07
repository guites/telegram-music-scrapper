import { Accordion, Badge, Button, Card, Container, Form, ListGroup, ListGroupItem, Offcanvas, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { read_registered_artists, read_musicbrainz_suggestions, read_telegram_message } from './requests';
import { Header } from './components/Header';
import f00nky from './f00nky.gif';
import './Artists.css';

export const Artists = () => {
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [artists, setArtists] = useState([]);
    const [totalMsgs, setTotalMsgs] = useState(0);
    const [countRange, setCountRange] = useState([0, 0]);
    
    const badgeColorCode = (count) => {
        // split the count range in 10 parts
        const range = countRange[1] - countRange[0];
        const step = range / 10;
        const index = Math.floor((count - countRange[0]) / step);
        if (index > 9) {
            return 'bg-9';
        }
        return `bg-${index}`;
    };

    const getMessageCountRange = (artists_list) => {
        let totalMessages = 0;
        const counts = artists_list.map((artist) => {
            const qtt = artist.telegram_messages.length;
            totalMessages += qtt;
            return qtt;
        });
        const min = Math.min(...counts);
        const max = Math.max(...counts);
        return [min, max, totalMessages];
    }

    const get_telegram_message_artists = async () => {
        const json_artists = await read_registered_artists();
        
        const [min, max, totalMessages] = getMessageCountRange(json_artists);
        setCountRange([min, max]);
        setTotalMsgs(totalMessages);
        
        setArtists(json_artists);
    };
    
    useEffect(() => {
        get_telegram_message_artists();
    }, []);

    const getMusicBrainzSuggestions = async (artist) => {
        const suggestions = await read_musicbrainz_suggestions(artist.id);
        
        const video_urls = [];
        for (let i = 0; i < artist.telegram_messages.length; i++) {
            const telegram_message = artist.telegram_messages[i];
            video_urls.push({"id": telegram_message.id, "title": telegram_message.webpage_title, "url": telegram_message.webpage_url});
        }

        setSelectedArtist({...artist, suggestions, video_urls});
        if (suggestions.length > 0) {
            setSelectedSuggestion(suggestions[0]);
        } else {
            setSelectedSuggestion(null);
        }
    }

    const getScoreTag = (score) => {
        if (score > 80) {
            return <Badge bg="success">{score}%</Badge>
        }
        if (score > 50) {
            return <Badge bg="warning">{score}%</Badge>
        }
        return <Badge bg="danger">{score}%</Badge>
    }

    const getSuggestionOptions = (suggestions) => {
        return suggestions.map((suggestion, idx) => {
            return (
                <option key={suggestions.mbid} value={idx}>
                    {suggestion.name} ({suggestion.score}%)
                </option>
            )
        })
    }

    const getSuggestionLiStacked = (label, value) => {
        return (
            <ListGroup.Item>
            <div>
                <div className="fw-bold"><small>{ label }</small></div>
                <small>{value}</small>
            </div>
            </ListGroup.Item>
        )
    }

    const getSuggestionLi = (label, value) => {
        return (
            <ListGroup.Item><small><strong>{ label }</strong>: {value}</small>
            </ListGroup.Item>
        )
    }

    const getSuggestionInfo = (suggestion) => {
        if (!suggestion) {
            return null;
        }
        const suggestionEls = [];
        suggestionEls.push(getSuggestionLiStacked("MusicBrainz id", suggestion['mbid']));
        suggestionEls.push(getSuggestionLiStacked("Name", suggestion['name']));
        suggestionEls.push(getSuggestionLi("Score", suggestion['score']));
        suggestionEls.push(getSuggestionLi("Ended", suggestion['life-span-ended']));

        if (suggestion['type']) {
            suggestionEls.push(getSuggestionLi("Type", suggestion['type']));
        }

        if (suggestion['area-name']) {
            suggestionEls.push(getSuggestionLi("Area", suggestion['area-name']));
        }

        if (suggestion['country']) {
            suggestionEls.push(getSuggestionLi("Country", suggestion['country']));
        }

        if (suggestion['life-span-begin']) {
            suggestionEls.push(getSuggestionLi("Life span begin", suggestion['life-span-begin']));
        }

        if (suggestion['life-span-end']) {
            suggestionEls.push(getSuggestionLi("Life span end", suggestion['life-span-end']));
        }

        if (suggestion['begin-area-name']) {
            suggestionEls.push(getSuggestionLi("Begin area", suggestion['begin-area-name']));
        }

        if (suggestion['disambiguation']) {
            suggestionEls.push(getSuggestionLi("Disambiguation", suggestion['disambiguation']));
        }

        return (
            <ListGroup variant="flush">
                { suggestionEls }
            </ListGroup>
        )
    }


    return (
        <>
        <Header/>
        <Container>
                <h1>Artists and Bands</h1>
                <img style={{maxWidth: "300px", float: "left"}} src={f00nky} alt="Funky Kong" />
                <Card><Card.Body>Showing <Badge bg="primary">{artists.length}</Badge> artists and bands from <Badge bg="primary">{totalMsgs}</Badge> telegram messages.</Card.Body></Card>
                {artists.map((artist) => {
                    return (
                        <Button onClick={() => getMusicBrainzSuggestions(artist)}
                        className="m-1" variant="light" key={artist.id}>
                            {artist.name} <Badge className={badgeColorCode(artist.telegram_messages.length)}>{artist.telegram_messages.length}</Badge>
                        </Button>
                )})}
        </Container>
        <Offcanvas show={selectedArtist !== null} onHide={() => setSelectedArtist(null)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{selectedArtist?.name}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Videos by {selectedArtist?.name}</Accordion.Header>
                    <Accordion.Body>
                        <ListGroup variant="flush">
                        {selectedArtist?.video_urls.map((vid, idx) => {
                            return ( <ListGroupItem><Button className="ta-left" variant="link" target="_blank" key={vid.id} href={vid.url}>{vid.title}</Button></ListGroupItem>)
                        })}
                        </ListGroup>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Configure artist</Accordion.Header>
                    <Accordion.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Suggestions</Form.Label>
                            <Form.Control as="select" onChange={(e) => setSelectedSuggestion(selectedArtist.suggestions[e.target.value])}>
                                { selectedArtist ? getSuggestionOptions(selectedArtist.suggestions) : null }
                            </Form.Control>
                        </Form.Group>
                        <Container>
                            <Row>
                                <div style={{display: "flex"}}>
                                    <h2>{selectedSuggestion?.name}</h2>&nbsp;<small>{getScoreTag(selectedSuggestion?.score)}</small>    
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
    )
};