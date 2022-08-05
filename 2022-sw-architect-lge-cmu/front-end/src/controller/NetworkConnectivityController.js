/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-case-declarations */
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { UncontrolledAlert } from 'reactstrap';

const PING_ECHO_PORT = 3505;
const PING_ECHO_INTERVAL_MS = 1000;

NetworkConnectivityController.propTypes = {
  host: PropTypes.string,
  onStateChange: PropTypes.func
};

function NetworkConnectivityController({ host, onStateChange }) {
  const [log, setLog] = useState(undefined);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket('ws://' + host + ':' + PING_ECHO_PORT);
      ws.onopen = () => {
        console.log("ping/echo connected");
        onStateChange(undefined);
        setLog(undefined);
      };
      ws.onmessage = (m) => { console.log("ping/echo onmessage", m) };
      ws.onclose = (e) => {
        const s = 'WARNING - Network Connection Lost!';
        onStateChange(s);
        setLog(s)
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

  return (<div style={{ position: 'absolute', top: 0, width: '100%', zIndex: 9 }}>
    {log &&
      <div style={{ position: 'fixed', top: '20%', width: '60%', zIndex: 3 }}>
        {log && <UncontrolledAlert color="danger">{log}</UncontrolledAlert>}
      </div>
    }
  </div >);
}

export default NetworkConnectivityController;