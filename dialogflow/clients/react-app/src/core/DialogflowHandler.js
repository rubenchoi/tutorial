import io from 'socket.io-client';
import RecordRTC from 'recordrtc';
import SocketStream from 'socket.io-stream';
import React, { Fragment } from 'react';
import { Setting, LoadPref, StatusLog } from '../util/Util.js';
import { Button } from 'reactstrap';
import Status from './Status.js';


const DEFAULT_PORT = 8000;
const DEFAULT_HOSTNAME = '127.0.0.1';

export default class DialogflowHandler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: Status.INITIALIZING,
            dfAddress: LoadPref('dfAddress', DEFAULT_HOSTNAME),
            dfPort: LoadPref('dfPort', DEFAULT_PORT),
            reload: false,
            log: undefined
        }
    }

    componentDidMount() {
        this.connect();
    }

    connect = () => {
        let url = "http://" + this.state.dfAddress + ':' + this.state.dfPort;
        console.log("connect: url=" + url);

        this.socket = io.connect(url, { 'reconnection': true });
        this.socket.on('connect', () => this.setState({ status: Status.IDLE }));
        this.socket.on('disconnect', () => this.setState({ status: Status.UNAVAILABLE }));
        this.socket.on('connect_error', (err) => this.setState({ status: Status.UNAVAILABLE }));
        this.socket.on('results', this.onDialogflowResult);
    }

    startDialogflowByAudioStream = () => {
        if (this.state.status !== Status.IDLE) {
            this.onDialogflowResult(undefined, "Dialogflow is busy - " + this.state.status);
            return;
        }

        this.setState({ status: Status.LISTENING });
        this.recorder = RecordRTC(this.props.stream, {
            type: 'audio',
            mimeType: 'audio/webm',
            sampleRate: 44100,
            desiredSampRate: 16000,
            recorderType: RecordRTC.StereoAudioRecorder,
            numberOfAudioChannels: 1,
            disableLogs: true,
            timeSlice: 3000,
            ondataavailable: b => {
                console.log("onDataAvailable...");
                let stream = SocketStream.createStream();
                SocketStream(this.socket).emit('stream', stream, {
                    name: 'stream.wav',
                    size: b.size
                }, this.props.includeTTSAudioData);
                SocketStream.createBlobReadStream(b).pipe(stream);
            }
        })
        this.recorder.startRecording();
    }

    onDialogflowResult = (response, err = undefined) => {
        console.log("onDialogflowResult():", response, err);

        try {
            this.recorder.stopRecording();
        } catch (err) {
            // this.setState({ log: "Error stop recording" });
        }

        this.setState({ status: Status.IDLE });

        try {
            console.log("Intent: ", response.queryResult.intent);
            if (response.queryResult.intent === null) {
                this.setState({ log: 'response is null', status: Status.IDLE })
                return;
            }

            let log = "Q: " + response.queryResult.queryText + "  A:"
                + (response.queryResult.fulfillmentText !== '' ? response.queryResult.fulfillmentText :
                    "[Intent]" + response.queryResult.intent.displayName);
            console.log(log);
            this.setState({ log: log });
        } catch (err) {
            console.log(err);
            this.setState({ log: "Error while parsing response" });
        }
    };

    render() {
        return (<>
            {this.props.showDetail &&
                <>
                    <StatusLog status={this.state.status} log={this.state.log} />
                    <Button color="primary" onClick={() => this.startDialogflowByAudioStream()} style={{ margin: "1em" }}>
                        Start Dialogflow
                    </Button>

                    {this.state.reload && <Button color="danger" onClick={() => window.location.reload()}>Reload required</Button>}
                    
                    <Setting
                        title={'Google Dialogflow'}
                        subtitle={(((this.state.status !== Status.UNAVAILABLE && this.state.status !== Status.INITIALIZING)
                            ? 'connected to ' : 'disconnected from ') + this.state.dfAddress + ':' + this.state.dfPort)}
                        items={[
                            { key: 'dfAddress', title: 'DF Host', defVal: this.state.dfAddress, callback: () => this.setState({ reload: true }) },
                            { key: 'dfPort', title: 'DF Port', defVal: this.state.dfPort, callback: () => this.setState({ reload: true }) }
                        ]}
                    />
                </>
            }
        </>);
    }
}
