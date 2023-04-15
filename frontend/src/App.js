import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Row from 'react-bootstrap/Row';
import Tooltip from 'react-bootstrap/Tooltip';
import Popover from 'react-bootstrap/Popover';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import './App.css';

export const App = () => {
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [artist, setArtist] = useState({
    query: null,
    options: null,
    loading: true,
  });
  const [cachedArtists, setCachedArtists] = useState([]);
  const [popOver, setPopOver] = useState({});
  const [text, setText] = useState([{
    id: null,
    webpage_description: null,
    webpage_title: null,
    beforeText: null,
    selectedText: null,
    afterText: null,
  }]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleShowDeleteModal = () => setShowDeleteModal(findById(selectedRow));
  const handleCloseDeleteModal = () => setShowDeleteModal(false);


  const read_telegram_messages = () => {
    fetch('http://localhost:8000/telegram_messages?site_name=YouTube&has_musicbrainz_artist=false&is_music=true')
      .then((response) => response.json())
      .then((received) => {
        const initial_text = [];
        received.forEach((row, _) => {
          initial_text.push({
            id: row.id,
            message: row.message,
            site_name: row.site_name,
            webpage_url: row.webpage_url,
            webpage_description: row.webpage_description,
            webpage_title: row.webpage_title,
            beforeText: null,
            selectedText: null,
            afterText: null,
          })
        });
        setText(initial_text);
      });
    }

  // fetch table data from backend
  useEffect(() => {
    read_telegram_messages();
  }, []);

  const sync_telegram_messages = () => {
    fetch('http://localhost:8000/telegram_messages/sync', {method: 'POST'})
      .then((response) => response.json())
      .then((j) => {
        console.log(j);
      });
    }

  const confirmArtist = () => {
    const selectedArtist = document.querySelector('#popover-basic select').value;
    const currentText = findById(selectedRow);
    setArtist({ ...artist, loading: true });
    fetch(`http://localhost:8000/telegram_messages/${currentText.id}/bind/${selectedArtist}`, {method: 'POST'})
      .then((response) => response.json())
      .then((j) => {
        console.log(j);
        setArtist({ ...artist, loading: false });
        setPopOver({id: null});
      });
  }

  const selectedArtistPopover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Confirme o artista</Popover.Header>
      <Popover.Body>
        <div><small>Buscando por:</small><br/><strong>{popOver.selectedText}</strong> { artist.loading && <Spinner animation="border" size="sm" /> }</div>
        <hr/>
        <Row>
          <Form>
            <Form.Group className="mb-3">
              <Form.Select disabled={ artist.loading } aria-label="Default select example">
                <option>Selecione o artista</option>
                {artist.options && artist.options.map((option, index) => (
                  <option key={index} value={option[2]}>{option[0]}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button onClick={ confirmArtist } variant="primary" size="sm" disabled={ artist.loading }>Confirmar</Button>
          </Form>
          </Row>
      </Popover.Body>
    </Popover>
  );

  const renderWhenSelected = (
    <div>
      {popOver.beforeText}
        <OverlayTrigger show={popOver.id !== null} placement="right" overlay={selectedArtistPopover}>
          <mark>{popOver.selectedText}</mark>
        </OverlayTrigger>
      {popOver.afterText}
    </div>
  )
  
  const findById = (id) => {
    return text.find((item) => item.id === id);
  }
  
  const findArtistInCacheByQuery = (query) => {
    return cachedArtists.find((item) => item.query === query);
  }

  const handleMouseUp = async (e) => {
    const windowSelection = window.getSelection();
    const selectedStr = windowSelection.toString();
    const currentText = findById(selectedRow);

    // check if target is inside the popover
    const popoverElement = document.getElementById('popover-basic');
    if (popoverElement && !popoverElement.contains(e.target)) {
      setPopOver({id: null});
    }

    if (selectedStr && selectedStr.length > 0 && currentText) {
      
      // get element wrapping the selection
      const selectedElement = windowSelection.focusNode.parentElement;

      const elClassName = selectedElement.parentElement.className;
      console.log("elClassName", elClassName);

      // only allow selection inside webpage_description
      if (!['webpage_description', 'webpage_title'].includes(elClassName)) {
        return;
      }

      const popOverInTitle = elClassName === 'webpage_title';
      
      setArtist({ ...artist, loading: true });

      if (popOverInTitle) {
        const index = currentText.webpage_title.indexOf(selectedStr);
        currentText.selectedText = selectedStr;
        currentText.beforeText = currentText.webpage_title.substring(0, index);
        currentText.afterText = currentText.webpage_title.substring(index + selectedStr.length);
      } else {
        const index = currentText.webpage_description.indexOf(selectedStr);
        currentText.selectedText = selectedStr;
        currentText.beforeText = currentText.webpage_description.substring(0, index);
        currentText.afterText = currentText.webpage_description.substring(index + selectedStr.length);
      }
      
      // show popover
      setPopOver({...currentText, inTitle: popOverInTitle});

      // update text with new currentText
      setText(text.map((item) => item.id === currentText.id ? currentText : item));

      submitArtist(selectedStr);
    }
  }

  const submitArtist = (artist) => {
    const cached = findArtistInCacheByQuery(artist);
    if (cached) {
      setArtist({ ...cached, loading: false });
      return;
    }
    fetch(`http://localhost:8000/musicbrainz_artists/search?name=${artist}`)
      .then((response) => response.json())
      .then((j) => {
        console.log(j);
        const newArtist = {
          query: artist,
          loading: false,
          options: j.match
        }
        setArtist(newArtist);
        setCachedArtists([...cachedArtists, newArtist]);
      });
  }

  const flagNotMusic = () => {
    fetch(`http://localhost:8000/telegram_messages/${selectedRow}?is_music=false`, {method: 'PATCH'})
      .then((response) => response.json())
      .then((j) => {
        console.log(j);
        setPopOver({id: null});
    });
  }

  const flagNotMusicModal = (
      <Modal show={ showDeleteModal != null } onHide={ handleCloseDeleteModal }>
        <Modal.Header closeButton>
          <Modal.Title>Este vídeo não é de música?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <a href={showDeleteModal.webpage_url} target="_blank">{showDeleteModal?.webpage_title}</a>
          </p>
          <p style={{maxHeight: "300px", overflowY: "scroll", whiteSpace: "pre-line"}}>{showDeleteModal?.webpage_description}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={ handleCloseDeleteModal }>
            Fechar
          </Button>
          <Button variant="primary" onClick={ flagNotMusic }>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
  )

  return (
    <Container>
    <Row>
      <h1>Telegram Messages</h1>
    </Row>
    <Row>
    <Table size="sm" striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Mensagem</th>
            <th>Origem</th>
            <th>Título da Página</th>
            <th>Descrição da Página</th>
          </tr>
        </thead>
        <tbody>
          {text.map((row, index) => (
            <tr id={`row-${row.id}`} className="float-anchor" key={row.id} onMouseUp={ handleMouseUp } onMouseEnter={() => { setSelectedRow(row.id) }} /* onMouseLeave={() => { setSelectedRow(null) }} */ >
              <td>
                {row.id}
                <ButtonGroup className={`floating-group ${selectedRow === row.id ? "visible" : ""}`} aria-label="Basic example">
                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip id={`tooltip-top`}>
                        Vídeo <strong>não</strong> é de música.
                      </Tooltip>
                    }>
                    <Button onClick={ handleShowDeleteModal } size="sm" variant="danger">✕</Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                  placement='top'
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      Selecione o <strong>nome do artista</strong> na descrição da página.
                    </Tooltip>
                    }>
                      <Button style={{cursor: "help"}} size="sm" variant="secondary">?</Button>
                    </OverlayTrigger>
                </ButtonGroup>
                { showDeleteModal && flagNotMusicModal }
              </td>
              <td>{row.message}</td>
              <td>{row.site_name}</td>
              <td className="webpage_title">
                <div>
                  { (popOver.id === row.id && popOver.inTitle) ? renderWhenSelected : row.webpage_title }
                </div>
              </td>
              <td className="webpage_description">
                <div>
                  { (popOver.id === row.id && !popOver.inTitle) ? renderWhenSelected : row.webpage_description }
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Row>
    <ButtonGroup>
      <Button onClick={ sync_telegram_messages }>Mais mensagens</Button>
    </ButtonGroup>
    </Container>
  );
}

export default App;