const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const MqttComponent = require('./mqttClient');

const DEFAULT_MQTT_ADDRESS = '3.35.144.112';
const DEFAULT_MQTT_PORT = 8006;


const app = require('express')();
app.get('/test/', (req, resp) => {
    resp.json({ type: 'test', data: 'Testdata' });
});

const api = functions.https.onRequest(app);

const relay = new MqttComponent(DEFAULT_MQTT_ADDRESS, DEFAULT_MQTT_PORT, {
    onConnect: () => console.log("connected"),
    onError: (err) => console.log("error", err),
    onMessage: (topic, payload) => {
        console.log("received:", topic, payload);
        realy.publish('topic2', 'forward ' + topic + ' [' + payload + '] to topic2');
    },
    subscribeTo: ['topic1']
});
relay.connect();

module.exports = {
    api
}
