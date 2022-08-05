import mqtt from 'mqtt';

const TOPIC_ADMIN_ALARM = 'topic-admin-alarm';

export default class MqttClient {
    constructor(url) {
        this.client = mqtt.connect(url);
        this.client.on('connect', () => {
            console.log("Connected to MQTT broker at " + url);
        });
    }

    subscribe = (topic = TOPIC_ADMIN_ALARM) => {
        this.debug("subscribing... " + topic);
        this.client.subscribe(topic, (packet, callback) => {
            const msg = packet.payload.toString()
            this.debug('Received message: ' + msg);
        });
    }

    publish = (payload = "test-payload", isServer) => {
        this.debug("publish[" + TOPIC_ADMIN_ALARM + "] " + payload);
        this.client.publish(TOPIC_ADMIN_ALARM, payload);
    }

    debug = m => {
        console.log("[MqttClient]", m);
    }
}
