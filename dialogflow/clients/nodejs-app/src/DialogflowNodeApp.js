'use strict';

const projectID = 'newagent-tdyh'
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'ko-KR';
const singleUtterance = true;
const interimResults = true;
const OUTPUT_AUDIO_ENCODING = 'OUTPUT_AUDIO_ENCODING_LINEAR_16';

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const util = require('util');
const uuid = require('uuid');
const { struct } = require('pb-util');

const dflow = require('dialogflow').v2beta1;

const { Transform, pipeline } = require('stream');
const socketIoStream = require('socket.io-stream');
const pump = util.promisify(pipeline);


const initServer = (port) => {
    let server = require('http').createServer(app);
    const io = require('socket.io')(server, {
        cors: {
            origin: '*',
        }
    });
    server.listen(port, () => console.log("server waiting for " + port));
    io.on('connection', (client) => start(client));
}

const start = (client) => {
    socketIoStream(client).on('stream', (stream, data, includeAudioData) => {
        const filename = path.basename(data.name);
        stream.pipe(fs.createWriteStream(filename));
        detectIntentStream(stream, (results) => {
            client.emit('results', results);
        }, includeAudioData)
    });
}

const detectIntentStream = async (audio, callback, includeAudioData) => {
    console.log("Detecting Intent Stream : start " + (includeAudioData && "w/audio"));
    const sessionClient = new dflow.SessionsClient();
    const stream = sessionClient.streamingDetectIntent()
        .on('data', (data) => {
            if (!data.recognitionResult) {
                console.log('Intent detected!');
                callback(data);
            } else {
                console.log('Intermediate transcript: ' + data.recognitionResult.transcript);
            }
        })
        .on('error', (err) => console.log(err))
        .on('end', () => console.log("===> ended"));

    const request = {
        session: sessionClient.sessionPath(projectID, uuid.v4()),
        queryInput: {
            audioConfig: {
                sampleRateHertz: sampleRateHertz,
                encoding: encoding,
                languageCode: languageCode
            },
            singleUtterance: singleUtterance
        },
        outputAudioConfig: includeAudioData ? { audioEncoding: OUTPUT_AUDIO_ENCODING, } : undefined
    }

    stream.write(request);
    await pump(audio, new Transform({
        objectMode: true,
        transform: (obj, _, next) => {
            next(null, {
                inputAudio: obj,
                outputAudioConfig: { audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16' }
            });
        }
    }), stream);
}

class DialogflowNodeApp {
    constructor(port) {
        initServer(port);
    }
}

module.exports = (port) => {
    return new DialogflowNodeApp(port);
}
