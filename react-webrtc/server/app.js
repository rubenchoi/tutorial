import fs from 'fs';
import path from 'path';
import os from 'os';
import WebRTCServer from './WebRTCServer.js'

const WEBRTC_SERVER_PORT_WS = 8080;
const WEBRTC_SERVER_PORT_WSS = 8081;

const tlsOption = getTLSOption();

const webRTCServer = new WebRTCServer(tlsOption, WEBRTC_SERVER_PORT_WS, WEBRTC_SERVER_PORT_WSS);

function getTLSOption() {
  let options;
  try {
    const isLocal = os.userInfo().username !== 'ubuntu' && os.userInfo().username !== 'root';
    const dir = isLocal ? path.resolve(path.resolve(), './cert/') : '/etc/letsencrypt/live/ruben.ml/';
    console.log('[TLS] Cert/keys from ' + dir);
    options = {
      ca: fs.readFileSync(path.resolve(dir, 'fullchain.pem')),
      key: fs.readFileSync(path.resolve(dir, 'privkey.pem')),
      cert: fs.readFileSync(path.resolve(dir, 'cert.pem'))
    };
  } catch (err) {
    console.log("failed to get TLS options");
    console.log(err);
  }
  return options;
}

export { };