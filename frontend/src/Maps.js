import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';

export const Maps = () => {
    const [data, setData] = useState("valor inicial");
    return (
        <>
        <Container>Mapas! {data} </Container>
        <Button onClick={() => setData("outro valor")}>
            Clique aqui
        </Button>
        </>
    )
};