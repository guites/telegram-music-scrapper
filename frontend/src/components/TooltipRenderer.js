import Tooltip from 'rc-tooltip';
import { Button } from 'react-bootstrap';
import 'rc-tooltip/assets/bootstrap.css';

export const TooltipRenderer = props => {
    const {
        letterNodes,
        range,
        rangeIndex,
        onMouseOverHighlightedWord,
        handleCancelSelection,
        handleConfirmSelection,
    } = props;
    const confirmOnClick = range => {
        handleConfirmSelection(range);
    };
    const cancelOnClick = range => {
        handleCancelSelection(range);
    };
    return (
        <Tooltip
            key={`${range.data.id}-${rangeIndex}`}
            onVisibleChange={onMouseOverHighlightedWord(range)}
            placement="top"
            overlay={
                <div>
                    <Button onClick={() => confirmOnClick(range)}>
                        Confirmar seleção
                    </Button>
                    <Button onClick={() => cancelOnClick(range)}>
                        Cancelar
                    </Button>
                </div>
            }
            defaultVisible={true}
            motion="zoom"
        >
            <span>{letterNodes}</span>
        </Tooltip>
    );
};
