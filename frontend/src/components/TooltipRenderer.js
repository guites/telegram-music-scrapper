import Tooltip from 'rc-tooltip';
import { Button, Container, Row } from 'react-bootstrap';
import 'rc-tooltip/assets/bootstrap.css';

const confirmArtistTooltip = (
    range,
    handleConfirmSelection,
    handleCancelSelection,
) => {
    return (
        <Container>
            <Row>
                <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleConfirmSelection(range)}
                >
                    Confirmar ✓
                </Button>
            </Row>
            <hr />
            <Row>
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancelSelection(range)}
                >
                    Cancelar ×
                </Button>
            </Row>
        </Container>
    );
};

const removeArtistTooltip = (range, handleRemoveSelection) => {
    return (
        <Container>
            <Row>
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveSelection(range)}
                >
                    Remover ×
                </Button>
            </Row>
        </Container>
    );
};

export const TooltipRenderer = props => {
    const {
        letterNodes,
        range,
        onMouseOverHighlightedWord,
        handleCancelSelection,
        handleConfirmSelection,
        handleRemoveSelection,
    } = props;
    const confirmOnClick = range => {
        handleConfirmSelection(range);
    };
    const cancelOnClick = range => {
        handleCancelSelection(range);
    };
    const removeOnClick = range => {
        handleRemoveSelection(range);
    };
    return (
        <Tooltip
            onVisibleChange={onMouseOverHighlightedWord(range)}
            placement="top"
            overlay={
                range.data.origin === 'automatic'
                    ? removeArtistTooltip(range, removeOnClick)
                    : confirmArtistTooltip(
                          range,
                          confirmOnClick,
                          cancelOnClick,
                      )
            }
            defaultVisible={true}
            motion="zoom"
        >
            <span>{letterNodes}</span>
        </Tooltip>
    );
};
