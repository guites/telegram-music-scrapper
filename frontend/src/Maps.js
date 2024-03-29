import { Header } from './components/Header';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import { read_artists_positions } from './requests';

import { Icon } from 'leaflet';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const Maps = () => {
    const myIcon = new Icon({
        iconUrl:
            'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        iconSize: [26, 42],
    });
    const [markers, setMarkers] = useState([]);
    const [mapRef, setMapRef] = useState(null);

    useEffect(() => {
        if (markers.length > 0 && mapRef.current !== null) {
            // Obter as coordenadas dos marcadores
            const coordinates = markers.map(marker => marker.position);
            // Ajustar o zoom e a posição do mapa para incluir todos os marcadores
            const bounds = L.latLngBounds(coordinates);
            mapRef.fitBounds(bounds);
        }
    }, [markers]);

    const changeMarkers = async () => {
        const new_markers = [...markers];
        const artistsPositions = await read_artists_positions();
        artistsPositions.forEach(artist => {
            const alreadyExists = new_markers.some(
                marker => marker.name === artist.name,
            );
            if (!alreadyExists) {
                new_markers.push(artist);
            }
        });
        setMarkers(new_markers);
    };
    return (
        <>
            <Header />
            <Container>
                <h1>Visualize as bandas no mapa!</h1>

                <Button
                    className="mb-3 mt-3"
                    onClick={() => changeMarkers()}
                >
                    Alterar marcações
                </Button>

                <MapContainer
                    ref={setMapRef}
                    style={{ height: 500 }}
                    center={[51.505, -0.09]}
                    zoom={13}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {markers.map((marker, id) => (
                        <Marker
                            key={id}
                            icon={myIcon}
                            position={marker.position}
                        >
                            <Popup>{marker.name}</Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Container>
        </>
    );
};
