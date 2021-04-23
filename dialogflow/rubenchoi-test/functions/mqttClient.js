const mqtt = require('mqtt');

module.exports = class MqttComponent {
    constructor(address, port, callbacks, subscribeTo) {
        this.address = address;
        this.port = port;
        this.callbacks = callbacks;
        this.subscribeTo = subsribeTo;
    }

    handleMessage = (topic, payload) => {
        let decodedPayload = new Buffer.from(payload, 'base64').toString('utf-8');
        this.callbacks.onMessage(topic, decodedPayload);
    }

    handleError = (err) => {
        this.callbacks.onError && this.callbacks.onError(err);
    }

    connect = () => {
        try {
            const url = 'ws://' + this.address + ':' + this.port;
            const mqttHandler = mqtt.connect(url);
            mqttHandler.on('connect', () => {
                this.subscribeTo.forEach(topic => {
                    mqttHandler.subscribe(topic);
                })
                this.callbacks.onConnect && this.callbacks.onConnect(true);
            });
            mqttHandler.on('disconnect', () => this.handleError('MQTT Disconnected'));
            mqttHandler.on('error', (err) => this.handleError(err));
            mqttHandler.on('message', this.handleMessage);
            this.mqttHandler = mqttHandler;
        } catch (err) {
            this.handleError(err);
        }
    }

    publish = (topic, payload) => {
        try {
            this.mqttHandler.publish(topic, payload);
        } catch (err) {
            console.log('ERROR: cannot publish');
        }
    };
}

