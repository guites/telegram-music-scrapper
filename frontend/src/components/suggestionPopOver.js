import { Button, Form, Popover, Row } from 'react-bootstrap';

const SuggestionPopOver = ({ suggestion }) => (
    <Popover id="popover-basic">
        <Popover.Header as="h3">Confirme o artista</Popover.Header>
        <Popover.Body>
            <div>
                <strong>{suggestion}</strong>
            </div>
            <hr />
            <Row>
                <Form>
                    <Button
                        variant="primary"
                        size="sm"
                        disabled={false}
                    >
                        Confirmar
                    </Button>
                </Form>
            </Row>
        </Popover.Body>
    </Popover>
);

export default SuggestionPopOver;
