import { Badge, Button, Container } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { read_registered_artists } from './requests';
import { Header } from './components/Header';
import f00nky from './f00nky.gif';
import './Artists.css';

export const Artists = () => {
    const [artists, setArtists] = useState([]);
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
        const counts = artists_list.map((artist) => {
            return artist.telegram_message_ids.length;
        });
        const min = Math.min(...counts);
        const max = Math.max(...counts);
        return [min, max];
    }

    const get_telegram_message_artists = async () => {
        const json_artists = await read_registered_artists();
        
        const [min, max] = getMessageCountRange(json_artists);
        setCountRange([min, max]);
        
        setArtists(json_artists);
    };
    
    useEffect(() => {
        get_telegram_message_artists();
    }, []);

    return (
        <>
        <Header/>
        <Container>
                <h1>Artists and Bands</h1>
                <img style={{maxWidth: "300px", float: "left"}} src={f00nky} alt="Funky Kong" />
                {artists.map((artist) => {
                    return <Button className="m-1" variant="light" key={artist.id}>{artist.name} <Badge className={badgeColorCode(artist.telegram_message_ids.length)}>{artist.telegram_message_ids.length}</Badge></Button>
                })}
        </Container>
        </>
    )
};