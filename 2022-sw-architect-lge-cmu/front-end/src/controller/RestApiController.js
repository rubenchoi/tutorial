/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-case-declarations */
/* eslint-disable no-alert */
// import { IconButton } from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { AccordionBody, AccordionHeader, AccordionItem, Badge, Button, Col, Input, InputGroup, InputGroupText, Row, Spinner, UncontrolledAccordion } from 'reactstrap';
// import Iconify from '../components/Iconify';
import NetworkConnectivityController from './NetworkConnectivityController';
import { ModelContextStore } from '../model/ModelStore';

const HTTPS_PORT = 3503;

RestApiController.propTypes = {
  showDetail: PropTypes.bool,
};
// ----------------------------------------------------------------------

const readStorage = (key, defaultValue = undefined) => {
  let r = localStorage.getItem(key);
  if (r === null) {
    r = defaultValue;
    localStorage.setItem(key, r);
  }
  return r
}

let log;

function RestApiController({ showDetail }) {
  const [protocol, setProtocol] = useState(readStorage('restapi_protocol', 'https:'));
  const [host, setHost] = useState(readStorage('restapi_host', '10.58.2.34'));
  const [port, setPort] = useState(readStorage('restapi_port', HTTPS_PORT));
  const [networkState, setNetworkState] = useState(undefined);

  const [msgSent, setMsgSent] = useState(undefined);
  const [platesFound, setPlatesFound] = useState(undefined);
  const [detectedCarNum, setDetectedCarNum] = useState('LKY1360');  // or try HHF6697
  const [ongoing, setOngoing] = useState(false);

  const modelContext = useContext(ModelContextStore);
  const { setResponse } = useContext(ModelContextStore);

  const [previousKeyword, setPreviousKeyword] = useState(undefined);

  useEffect(() => {
    log = '';
  }, []);

  const saveFile = async (blob) => {
    const a = document.createElement('a');
    a.download = 'my-file.txt';
    a.href = URL.createObjectURL(blob);
    a.addEventListener('click', (e) => {
      setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
  };

  const obj = { hello: 'world' };
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });

  useEffect(() => {
    if (modelContext.command === undefined) {
      return;
    }
    console.log("modelContext.command", modelContext.command);
    switch (modelContext.command.type) {
      case 'search':
        if (previousKeyword === modelContext.command.data.keyword) {
          return;
        }
        setPreviousKeyword(modelContext.command.data.keyword);
        requestToSearch(modelContext.command.data.keyword);
        break;
      case 'login':
        requestToLogin(modelContext.command.data);
        break;
      case 'logout':
        requestToLogout();
        break;
      default:
        break;
    }
  }, [modelContext.command])

  function getUrl(api = undefined) {
    return protocol + '//' + host + ':' + port + '/' + api;
  }

  const requestToSearch = async (pnum) => {
    console.log("requestToSearch:", pnum);
    if (networkState) {
      console.log("ignored - networkState", networkState);
      return;
    }
    const url = getUrl('platenumber') + "/" + pnum;
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken === undefined) {
      // TODO
    }
    const header = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };
    setOngoing(true);

    const s = 'GET request to ' + url + '  with param: ' + JSON.stringify(header);
    console.log('[LOG] REQUEST ' + Date.now() + ' ' + pnum);
    log += '[LOG] REQUEST ' + Date.now() + ' ' + pnum + '\n';
    console.log(s);
    setMsgSent(s);

    axios
      .get(url, header)
      .then(response => {
        const plates = [];
        for (let i = 0; i < response.data.length; i += 1) {
          plates.push(response.data[i].plate);
        }
        console.log('[LOG] RESPONSE ' + Date.now() + ' ' + plates.join(' '));
        log += '[LOG] RESPONSE ' + Date.now() + ' ' + plates.join(' ') + '\n';
        console.log('response.data', response.data, url, header);
        setOngoing(false);
        response.data && setPlatesFound(response.data);
        response.data && setResponse({ type: 'searchResult', data: response.data });
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
    if (networkState) {
      console.log("ignored - networkState", networkState);
      return;
    }
    const url = getUrl('login');
    const param = { id: data.id, pw: data.pw };
    setOngoing(true);
    setMsgSent("login requested");

    axios
      .post(url, param)
      .then(response => {
        console.log('response', response.data.accessToken);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setOngoing(false);
      })
      .catch(err => {
        console.log('err', err);
      });
  }

  const requestToLogout = () => {
    if (networkState) {
      console.log("ignored - networkState");
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
    {showDetail &&
      <Draggable>
        <div style={
          // props.fitToWindow ?
          // { position: 'fixed', top: 0, right: 0, margin: '1em', width: '450px', padding: '2em', borderRadius: '25px', background: 'rgba(255,255,255,0.7)' } :
          { zoom: 0.8, position: 'absolute', left: '50%', width: '40%', padding: '1em', background: 'rgba(221, 211, 242, 0.7)', borderRadius: '25px', fontSize: '1em' }}>
          {/* <div style={{ position: 'absolute', right: 0, top: 0 }}>
            <IconButton onClick={() => setHideMenu(true)}>
              <Iconify icon="ant-design:close-circle-filled" />
            </IconButton>
          </div> */}
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
                <Button color="danger" onClick={() => {
                  const blob2 = new Blob([log], { type: 'text/plain' });
                  saveFile(blob2);
                }}>Save LOG</Button>
              </AccordionBody>
            </AccordionItem>
          </UncontrolledAccordion>
        </div>
      </Draggable>
    }

    <NetworkConnectivityController
      host={host}
      onStateChange={(s) => setNetworkState(s)}
    />
  </div>);
}

export default RestApiController;