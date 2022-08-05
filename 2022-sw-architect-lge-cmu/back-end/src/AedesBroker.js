import Aedes from 'aedes';
import http from 'http';
import websocketStream from 'websocket-stream';
import net from 'net';

const PORT = 1883;
const PORT_WS = 8888;

const TOPIC_ADMIN_ALARM = 'topic-admin-alarm';

const mqtt = Aedes();

export default class AedesBroker {
    constructor(port_ws = PORT_WS, port = PORT) {
        const httpServer = http.createServer();
        websocketStream.createServer({ server: httpServer }, mqtt.handle);
        httpServer.listen(port_ws, () => {
            this.debug('MQTT broker on ' + port_ws);
            this.subscribe();
        });
        const wsServer = net.createServer(mqtt.handle);
        wsServer.listen(port, () => {
            this.debug('MQTT broker on  ' + port);
            this.subscribe();
        });
    }

    subscribe = (topic = TOPIC_ADMIN_ALARM) => {
        this.debug("subscribing... " + topic);
        mqtt.subscribe(topic, (packet, callback) => {
            const msg = packet.payload.toString()
            this.debug('Received message: ' + msg);
        });
    }

    publish = (payload = "test-payload") => {
        this.debug("publish[" + TOPIC_ADMIN_ALARM + "] " + payload);
        mqtt.publish({ topic: TOPIC_ADMIN_ALARM, payload: payload })
    }

    debug = m => {
        console.log("[AedesBroker]", m);
    }
}
