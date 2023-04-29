import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import SuggestionPopOver from './suggestionPopOver';

const ParsedBlock = ({ type, content }) => {
    switch (type) {
        case 'mark':
            return <mark>{content}</mark>;
        case 'suggestion':
            return (
                <OverlayTrigger show={true} placement="top" overlay={SuggestionPopOver}>
                    <mark className="nlp-suggestion">{content}</mark>
                </OverlayTrigger>
            )
        default:
            return <span>{content}</span>;
    }
};

export default ParsedBlock;
