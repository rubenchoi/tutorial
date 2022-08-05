import RestApiServer from './RestApiServer.js';
import EchoServer from './EchoServer.js';
import AedesBroker from './AedesBroker.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import MqttClient from './AedesClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REST_API_PORT_HTTP = 3502;
const REST_API_PORT_HTTPS = 3503;
const ECHO_SERVER_PORT = 3505;

const USE_EXTERNAL_MQTT_BROKER = true;
const EXTERNAL_MQTT_BROKER_URL = 'ws://3.34.7.143:8888'

function getTLSOption() {
  let options;
  try {
    const dir = path.resolve(__dirname, '../cert/');
    console.log('[TLS] Cert/keys from ' + dir);
    options = {
      ca: fs.readFileSync(path.resolve(dir, 'server.csr')),
      key: fs.readFileSync(path.resolve(dir, 'server.key')),
      cert: fs.readFileSync(path.resolve(dir, 'server.crt'))
    };
  } catch (err) {
    console.log("failed to get TLS options");
    console.log(err);
  }
  return options;
}
let mqtt;
if (USE_EXTERNAL_MQTT_BROKER) {
  mqtt = new MqttClient(EXTERNAL_MQTT_BROKER_URL);
} else {
  mqtt = new AedesBroker();
}
console.log("MQTT ready");
new RestApiServer(getTLSOption(), REST_API_PORT_HTTP, REST_API_PORT_HTTPS, mqtt);
new EchoServer(ECHO_SERVER_PORT);
console.log("All ready");


export { };

