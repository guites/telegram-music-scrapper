import { Button, Modal } from 'react-bootstrap';

const SetIsMusicModal = ({
    showIsMusicModal,
    handleCloseIsMusicModal,
    setIsMusicFlag,
}) => {
    return (
        <Modal
            show={showIsMusicModal != false}
            onHide={handleCloseIsMusicModal}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {showIsMusicModal.id} |{' '}
                    {showIsMusicModal.isMusic
                        ? 'Marcou todos os artistas?'
                        : 'Este vídeo não é de música?'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    <a
                        href={showIsMusicModal.webpage_url}
                        rel="noreferrer"
                        target="_blank"
                    >
                        {showIsMusicModal?.webpage_title}
                    </a>
                </p>
                <p
                    style={{
                        maxHeight: '300px',
                        overflowY: 'scroll',
                        whiteSpace: 'pre-line',
                    }}
                >
                    {showIsMusicModal?.webpage_description}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleCloseIsMusicModal}
                >
                    Fechar
                </Button>
                <Button
                    variant={
                        showIsMusicModal.isMusic ? 'success' : 'danger'
                    }
                    onClick={() =>
                        setIsMusicFlag(
                            showIsMusicModal.id,
                            showIsMusicModal.isMusic,
                        )
                    }
                >
                    {showIsMusicModal.isMusic ? 'Marquei' : 'Não é música'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SetIsMusicModal;
