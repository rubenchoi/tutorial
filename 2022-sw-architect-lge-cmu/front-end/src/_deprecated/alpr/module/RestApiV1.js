/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-case-declarations */
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, CardImg, CardTitle, CardSubtitle, Input, InputGroup, Spinner, UncontrolledAlert, Row, Col, UncontrolledAccordion, AccordionItem, AccordionHeader, AccordionBody, InputGroupText } from 'reactstrap';
import Draggable from 'react-draggable';
import { IconButton } from '@mui/material';
import Iconify from '../../../components/Iconify';

const BORDER_COLOR = 'rgba(245, 220, 145, 0.8)';

const HTTPS_PORT = 3503;
const PING_ECHO_PORT = 3505;
const PING_ECHO_INTERVAL_MS = 1000;

const readStorage = (key, defaultValue = undefined) => {
  let r = localStorage.getItem(key);
  if (r === null) {
    r = defaultValue;
    localStorage.setItem(key, r);
  }
  return r
}

function RestApiComponent(props) {
  const [protocol, setProtocol] = useState(readStorage('restapi_protocol', 'https:'));
  const [host, setHost] = useState(readStorage('restapi_host', '10.58.2.34'));
  const [port, setPort] = useState(readStorage('restapi_port', HTTPS_PORT));

  const [msgSent, setMsgSent] = useState(undefined);
  const [platesFound, setPlatesFound] = useState(undefined);
  const [detectedCarNum, setDetectedCarNum] = useState('LKY1360');  // or try HHF6697
  const [ongoing, setOngoing] = useState(false);
  const [request, setRequest] = useState(undefined);

  const [networkFailure, setNetworkFailure] = useState("Ping/echo connecting...");
  const [alert, setAlert] = useState(undefined);
  const [found, setFound] = useState(undefined);
  const [isPartial, setIsPartial] = useState(false);

  const [hideMenu, setHideMenu] = useState(!props.showDetail);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket('ws://' + host + ':' + PING_ECHO_PORT);
      ws.onopen = () => {
        console.log("ping/echo connected");
        setNetworkFailure(undefined);
      };
      ws.onmessage = (m) => { console.log("ping/echo onmessage", m) };
      ws.onclose = (e) => {
        setNetworkFailure('WARNING - Network Connection Lost!')
        console.log('network is disconnected', e);
        setTimeout(() => {
          connect();
        }, PING_ECHO_INTERVAL_MS);
      };
      ws.onerror = (err) => {
        console.error(err.message, '...closing socket');
        ws.close();
      };
    }
    connect();
  }, []);

  useEffect(() => {
    try {
      if (platesFound === undefined) {
        return;
      }
      console.log(platesFound);
      if (platesFound.length < 1) {
        return;
      }
      setIsPartial(platesFound.length > 1);

      // TODO when multiple
      const m = platesFound[0];
      console.log(m);
      switch (m.status) {
        case "Owner Wanted":
        case "Stolen":
        case "Unpaid Fines - Tow":
          setTimeout(() => setAlert(undefined), 3000);
          const s = m.plate + " - " + m.status + "!!"
          setAlert(s);
          break;
        case "No Wants/Warrants":
          break;
        default:
          break;
      }
      if (!found || (found.plate !== m.plate)) {
        setFound(m);
      }
    } catch (err) {
      console.error(err);
    }
  }, [platesFound]);

  useEffect(() => {
    // console.log("RestApi", props.request)
    setRequest(props.request);
  }, [props.request])

  useEffect(() => {
    if (request === undefined) {
      return;
    }
    console.log("request", request);
    switch (request.type) {
      case 'search':
        requestToSearch(request.keyword);
        break;
      case 'login':
        requestToLogin(request.login);
        break;
      case 'logout':
        requestToLogout();
        break;
      default:
        break;
    }
  }, [request]);

  const getBirth = (birth) => {
    return birth;
  }

  const getCard = m => {
    const sz1 = '4';
    return (
      <Card
        style={{ width: '100%', border: '10px solid ' + BORDER_COLOR }}
        color={m.status === "No Wants/Warrants" ? 'black' : 'red'}>
        <CardImg
          alt="car image"
          src={'/static/icons/logo_team.png'}
          top
          width="100%"
          height="100px"
        />
        <CardBody>
          <CardTitle tag="h5">
            {m.plate} {isPartial && '[Partial Match]'}
          </CardTitle>
          <CardSubtitle
            className="mb-2 text-muted"
            tag="h6"
          >
            {m.status}
          </CardSubtitle>
          <div>
            <Row>
              <Col xs={sz1}>Registration:</Col>
              <Col> {m.registration}</Col>
            </Row>
            <Row>
              <Col xs={sz1}>Owner:</Col>
              <Col> {m.ownerName} {getBirth(m.ownerBirth)}</Col>
            </Row>
            <Row>
              <Col xs={sz1}>Address:</Col>
              <Col> {m.ownerAddress}, {m.ownerCity}</Col>
            </Row>
            <Row>
              <Col xs={sz1}>Vehicle</Col>
              <Col> {m.vehicleYear} / {m.vehicleMaker} / {m.vehicleModel} / {m.vehicleColor}</Col>
            </Row>
          </div>
          <hr />
          <Button color="secondary" onClick={() => setFound(undefined)}>
            CLOSE
          </Button>
        </CardBody>
      </Card>
    );
  }

  const getUrl = (api = undefined) => {
    return protocol + '//' + host + ':' + port + '/' + api;
  }

  const requestToSearch = async (pnum) => {
    console.log("requestToSearch:", pnum);
    if (networkFailure) {
      console.log("ignored - networkFailure", networkFailure);
      return;
    }
    const url = getUrl('platenumber') + "/" + pnum;
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken === undefined) {
      // TODO !
    }
    const header = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };
    setOngoing(true);

    const s = 'GET request to ' + url + '  with param: ' + JSON.stringify(header);
    console.log(s);
    setMsgSent(s);

    axios
      .get(url, header)
      .then(response => {
        console.log('response.data', response.data);
        setOngoing(false);
        response.data && setPlatesFound(response.data);
      })
      .catch(err => {
        console.log('error', err);
        if (err && err.response) {
          switch (err.response.status) {
            case 403:
              const s = "WARNING! You must allow private access as follows: \n\nPlease open https://" + window.location.hostname + ":" + port
                + "\nand click <Advanced> to proceed the unsafe site."
                + "\n\nRequired only once at the very beginning \nand this is because of the self-signed certificate."
                + "\n\nOK to open URL."
              if (window.confirm(s)) {
                window.location.href = 'https://' + window.location.hostname + ":" + port;
              };
              window.alert()
              break;
            default:
              break;
          }
        }
      });
  }

  const requestToLogin = async (data) => {
    console.log("requestToLogin");
    if (networkFailure) {
      console.log("ignored - networkFailure", networkFailure);
      return;
    }
    const url = getUrl('login');
    const param = { id: data.username, pw: data.password };
    setOngoing(true);
    setMsgSent("login requested");

    axios
      .post(url, param)
      .then(response => {
        console.log('response');
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setOngoing(false);
      })
      .catch(err => {
        console.log('err', err);
      });
  }

  const requestToLogout = () => {
    if (networkFailure) {
      console.log("ignored - networkFailure");
      return;
    }
    localStorage.setItem('accessToken', undefined);
    localStorage.setItem('refreshToken', undefined);
  }

  const saveConnectionSetting = () => {
    localStorage.setItem('restapi_protocol', protocol);
    localStorage.setItem('restapi_host', host);
    localStorage.setItem('restapi_port', port);
  }

  return (<div style={{ position: 'absolute', top: 0, width: '100%', zIndex: 2 }}>

    {found && <>
      <Draggable handle=".handle">
        <div style={{
          position: 'fixed',
          width: '500px',
          top: '20%',
          left: '50%',
          marginLeft: '-250px',
          zIndex: 3
        }}>
          <div className="handle" style={{ width: '40px', background: BORDER_COLOR }}>
            <IconButton>
              <Iconify icon="el:move" />
            </IconButton>
          </div>
          {getCard(found)}
        </div>
      </Draggable>
    </>
    }

    {(props.showDetail && !hideMenu) &&
      <Draggable>
        <div style={
          // props.fitToWindow ?
          // { position: 'fixed', top: 0, right: 0, margin: '1em', width: '450px', padding: '2em', borderRadius: '25px', background: 'rgba(255,255,255,0.7)' } :
          { position: 'absolute', bottop: 0, right: 0, width: '40%', padding: '2em', background: 'rgba(221, 211, 242, 0.7)', borderRadius: '25px', fontSize: '0.8em' }}>
          <div style={{ position: 'absolute', right: 0, top: 0 }}>
            <IconButton onClick={() => setHideMenu(true)}>
              <Iconify icon="ant-design:close-circle-filled" />
            </IconButton>
          </div>
          <h5>REST Communication</h5>
          <p>{protocol + '//' + host + ':' + port}</p>
          <UncontrolledAccordion stayOpen defaultOpen={["1"]}>
            <AccordionItem>
              <AccordionHeader targetId="1">
                Log
              </AccordionHeader >
              <AccordionBody accordionId="1">
                {ongoing ?
                  <h6 style={{ color: 'red' }}><Spinner /> Waiting for server response...</h6>
                  :
                  <>
                    <Row>
                      <Col xs='2'>Sent:</Col>
                      <Col style={{ marginBottom: '1em', color: 'blue' }}>{msgSent}</Col>
                    </Row>
                    <Row>
                      <Col xs='2'>Received:</Col>
                      <Col style={{ marginBottom: '1em', color: 'blue' }}>{JSON.stringify(platesFound)}</Col>
                    </Row>
                  </>
                }
              </AccordionBody>
            </AccordionItem>
            <AccordionItem>
              <AccordionHeader targetId="2">
                Unit Test
              </AccordionHeader>
              <AccordionBody accordionId="2">
                <>
                  <Badge color="primary" style={{ marginBottom: '1em' }}>Assuming a plate number is found from ALPR</Badge>
                  <p style={{ fontSize: '0.8em' }}>Try LKY1360 or HHF6697</p>
                  <InputGroup style={{ width: '300px' }}>
                    <Input type="textfield" defaultValue={detectedCarNum} onChange={e => setDetectedCarNum(e.target.value)} />
                    <Button onClick={() => requestToSearch(detectedCarNum)}>Send to server</Button>
                  </InputGroup>
                </>
              </AccordionBody>
            </AccordionItem>
            <AccordionItem>
              <AccordionHeader targetId="3">
                Settings
              </AccordionHeader>
              <AccordionBody accordionId="3">
                <InputGroup style={{ width: '300px' }}>
                  <InputGroupText>Protocol</InputGroupText>
                  <Input type="textfield" defaultValue={protocol} onChange={e => setProtocol(e.target.value)} />
                </InputGroup>
                <InputGroup style={{ width: '300px' }}>
                  <InputGroupText>Host</InputGroupText>
                  <Input type="textfield" defaultValue={host} onChange={e => setHost(e.target.value)} />
                </InputGroup>
                <InputGroup style={{ width: '300px' }}>
                  <InputGroupText>Port</InputGroupText>
                  <Input type="textfield" defaultValue={port} onChange={e => setPort(e.target.value)} />
                </InputGroup>
                <Button color="primary" onClick={() => saveConnectionSetting()}>SAVE</Button>
                <p>You MUST refresh the browser to apply changes after SAVE.</p>
              </AccordionBody>
            </AccordionItem>
          </UncontrolledAccordion>
        </div>
      </Draggable>
    }

    {
      (alert || networkFailure) &&
      <div style={{ position: 'fixed', top: '20%', width: '60%', zIndex: 3 }}>
        {alert && <UncontrolledAlert color="danger">{alert}</UncontrolledAlert>}
        {networkFailure && <UncontrolledAlert color="danger">{networkFailure}</UncontrolledAlert>}
      </div>
    }

  </div >);
}

export default RestApiComponent;