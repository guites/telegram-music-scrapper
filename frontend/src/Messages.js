import { useCallback, useEffect, useState } from 'react';
import { read_telegram_messages, sync_telegram_messages } from './requests';
import { Badge, Button, ButtonGroup, Container, Form, Modal, OverlayTrigger, Popover, Row, Table, Tooltip } from 'react-bootstrap';
import { Header } from './components/Header';
import ch00nky from './assets/ch00nky.gif';
import './App.css';
import Highlightable from 'highlightable';


export const Messages = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [artist, setArtist] = useState({
    query: null,
    options: null,
    loading: false,
  });
  const [popOver, setPopOver] = useState({});
  const [text, setText] = useState([{
    id: null,
    webpage_description: null,
    webpage_title: null,
    beforeText: null,
    selectedText: null,
    afterText: null,
  }]);
  const [gettingMoreMessages, setGettingMoreMessages] = useState(false);

  const [showIsMusicModal, setShowIsMusicModal] = useState(false);
  const handleShowIsMusicModal = (isMusic) => setShowIsMusicModal({...findById(selectedRow), isMusic: isMusic});
  const handleCloseIsMusicModal = () => setShowIsMusicModal(false);
    
  const findById = (id) => {
    return text.find((item) => item.id === id);
  }

  const request_telegram_messages = useCallback(async () => {
    const telegram_messages = await read_telegram_messages(null);
    const initial_text = [];
    telegram_messages.forEach((row, _) => {
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
  }, []);

  const get_more_messages = async () => {
    setGettingMoreMessages(true);
    await sync_telegram_messages();

    // get item from text with biggest id
    let biggest_id_item;
    if (text.length === 0) {
      biggest_id_item = {id: null};
    } else {
      biggest_id_item = text.reduce((prev, current) => (prev.id > current.id) ? prev : current);
    }
    
    const telegram_messages = await read_telegram_messages(biggest_id_item.id);
    // make a copy of the text array
    const new_text = [...text];
    // add new messages to the copy
    telegram_messages.forEach((row, _) => {
      if (row.id > biggest_id_item.id) {
        new_text.push({
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
      }
    });
    setText(new_text);
    setGettingMoreMessages(false);
  }

  // fetch table data from backend
  useEffect(() => {
    request_telegram_messages();
  }, []);

  const confirmArtist = async (artist_name) => {
    const currentText = findById(selectedRow);
    setArtist({ ...artist, loading: true });
    const request = await fetch(
      `http://localhost:8000/telegram_messages/${currentText.id}/artist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          {
            artist_name: artist_name
          }
        )
      });
    const response = await request.json();
    console.log(response);
    setArtist({ ...artist, loading: false });
    if (request.ok) {
      // setText(text.filter((item) => item.id !== currentText.id));
      setPopOver({id: null});
    }
  }

  const selectedArtistPopover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Confirme o artista</Popover.Header>
      <Popover.Body>
        <div><strong>{popOver.selectedText}</strong></div>
        <hr/>
        <Row>
          <Form>
            <Button onClick={ () => confirmArtist(popOver.selectedText) } variant="primary" size="sm" disabled={ artist.loading }>Confirmar</Button>
          </Form>
          </Row>
      </Popover.Body>
    </Popover>
  );

  const setIsMusicFlag = async (telegram_message_id, is_music) => {
    const request = await fetch(`http://localhost:8000/telegram_messages/${telegram_message_id}?is_music=${is_music}`, {method: 'PATCH'})
    const response = await request.json();
    console.log(response);

    // TODO: handle errors
    setText(text.filter((item) => item.id !== telegram_message_id));
    setPopOver({id: null});
    setShowIsMusicModal(false);
  }

  const setIsMusicModal = (
      <Modal show={ showIsMusicModal != null } onHide={ handleCloseIsMusicModal }>
        <Modal.Header closeButton>
          <Modal.Title>{showIsMusicModal.id} | { showIsMusicModal.isMusic ? "Marcou todos os artistas?" : "Este vídeo não é de música?" }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <a href={showIsMusicModal.webpage_url} target="_blank">{showIsMusicModal?.webpage_title}</a>
          </p>
          <p style={{maxHeight: "300px", overflowY: "scroll", whiteSpace: "pre-line"}}>{showIsMusicModal?.webpage_description}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={ handleCloseIsMusicModal }>
            Fechar
          </Button>
          <Button variant={ showIsMusicModal.isMusic ? "success" : "danger" } onClick={ () => setIsMusicFlag(showIsMusicModal.id, showIsMusicModal.isMusic) }>
            { showIsMusicModal.isMusic ? "Marquei" : "Não é música" }
          </Button>
        </Modal.Footer>
      </Modal>
  )

  const [ranges, setRanges] = useState([]);

  const getRangeById = (id) => {
    const rangeById = ranges.find((range) => range.id === id);
    if (rangeById) {
      return rangeById.ranges;
    }
    return [];
  }
  const highlightRange = (range) => {
    return { ...range, type: 'HIGHLIGHT_RANGE' };
  }

  const onTextHighlighted = (range) => {
    const receivedRangeId = range.data.id;
    const currRange = ranges.find((range) => range.id === receivedRangeId);
    const newRanges = ranges.filter((range) => range.id !== receivedRangeId);
    
    if (currRange) {
      currRange.ranges.push(highlightRange(range));
      setRanges([...newRanges, currRange]);
    } else {
      setRanges(
        [
          ...newRanges,
          {
            "id": receivedRangeId,
            "ranges": [highlightRange(range)]
          }
        ]
      );
    }

    window.getSelection().removeAllRanges();
  }


  return (
    <>
    <Header/>
    <Container>
    <Row>
      <div style={{display: "flex"}}><h1>Band Hunter</h1>&nbsp;<small><Badge bg="secondary">alpha</Badge></small></div>
      <p><img style={{maxWidth: "300px", float: "left"}} src={ch00nky} alt="Chunky Kong" />Ajude a marcar artistas e bandas nos vídeos listados abaixo!<br/><br/>❓Para marcar, selecione o texto com o mouse.<br/><br/>✅ Não esqueça de marcar os vídeos como concluídos!<br/><br/>❌ Sinalize vídeos que não são de música.</p>
      <p></p>
      <p></p>
    </Row>
    <Row>
    <Table size="sm" striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>URL do vídeo</th>
            <th>Título</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {text.map((row, index) => (
            <tr className="float-anchor" key={row.id}> 
            <td>
              {row.id}
            </td>
            <td>{row.message}</td>
            <td className="webpage_title">
              <Highlightable
                ranges={getRangeById(`title-${row.id}`)}
                enabled={true}
                onTextHighlighted={onTextHighlighted}
                id={`title-${row.id}`}
                highlightStyle={{
                  backgroundColor: '#ffcc80'
                }}
                text={row.webpage_title ?? ""}  
              />  
            </td>
            <td className="webpage_description">
              <Highlightable
                ranges={getRangeById(`descr-${row.id}`)}
                enabled={true}
                onTextHighlighted={onTextHighlighted}
                id={`descr-${row.id}`}
                highlightStyle={{
                  backgroundColor: '#ffcc80'
                }}
                text={row.webpage_description ?? ""}  
              />  
            </td>
          </tr>
          ))}
            {/* <tr className="float-anchor">
              <td>
                1
              </td>
              <td>https://youtu.be/GBe5KoLYepk</td>
              <td className="webpage_title">
                <Highlightable ranges={getRangeById('vid-descr-1')}
                enabled={true}
                onTextHighlighted={onTextHighlighted}
                id={'vid-descr-1'}
                highlightStyle={{
                  backgroundColor: '#ffcc80'
                }}
                text={"Rael - Passiflora part. Céu, RDD e Ailton Krenak"}  
              />  
              </td>
            </tr> */}
        </tbody>
      </Table>
    </Row>
    <ButtonGroup>
      <Button disabled={gettingMoreMessages} onClick={ get_more_messages }>Mais mensagens</Button>
    </ButtonGroup>
    </Container>
    </>
  );
}

export default Messages;