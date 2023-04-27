import { Button, Form, Popover, Row } from 'react-bootstrap';

const SelectedArtistPopover = ({ popOver, loading, confirmArtist }) => (
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
                        onClick={() => confirmArtist(popOver.selectedText)}
                        variant="primary"
                        size="sm"
                        disabled={loading}
                    >
                        Confirmar
                    </Button>
                </Form>
            </Row>
        </Popover.Body>
    </Popover>
);

export default SelectedArtistPopover;
