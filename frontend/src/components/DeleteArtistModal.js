import { Modal, Button } from 'react-bootstrap';

export const DeleteArtistModal = props => {
    const { show, handleClose, artist, handleDelete } = props;
    if (!artist) return null;
    const videoOrVideos =
        artist.telegram_messages.length > 1 ? 'vídeos' : 'vídeo';
    const warningMessage =
        artist.telegram_messages.length > 0 ? (
            <p>
                Este artista está marcado em{' '}
                <strong>
                    {artist.telegram_messages.length} {videoOrVideos}
                </strong>
                . Estes dados serão removidos.
            </p>
        ) : (
            <p>
                Este artista não está marcado em nenhum vídeo. Apenas os
                dados do artista serão removidos.
            </p>
        );
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Deletar artista?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Você tem certeza que deseja{' '}
                    <mark>
                        deletar o artista <strong>{artist.name}</strong>
                    </mark>
                    ?
                </p>
                {warningMessage}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
                <Button variant="danger" onClick={() => handleDelete()}>
                    Deletar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
