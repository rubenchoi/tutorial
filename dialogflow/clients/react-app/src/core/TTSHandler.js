import React, { Fragment } from 'react';
import { Button } from 'reactstrap';
import io from 'socket.io-client';
import { LoadPref, Setting, StatusLog } from '../util/Util.js';
import Status from './Status.js';
import TTSPlayer from '../util/TTSPlayer.js';

const DEFAULT_PORT = 8000;
const DEFAULT_HOSTNAME = '127.0.0.1';

export default class TTSHandler extends React.Component {
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
        this.socket.on('tts-result', this.onTTSResult);
    }

    startTTS = (text) => {
        console.log("TTS text:" + text, this.socket);
        this.socket.emit('tts', text);
    }

    onTTSResult = (response, err = undefined) => {
        console.log("onTTSResult():", response, err);
        this.setState({ status: Status.IDLE, audioData: response });
    };

    render() {
        return (<>
            {this.props.showDetail &&
                <>
                    <StatusLog status={this.state.status} log={this.state.log} />
                    <Button color="primary" onClick={() => this.startTTS('안녕하세요')} style={{ margin: "1em" }}>
                        Test TTS
                    </Button>

                    {this.state.reload && <Button color="danger" onClick={() => window.location.reload()}>Reload required</Button>}

                    <Setting
                        title={'Google TTS'}
                        subtitle={(((this.state.status !== Status.UNAVAILABLE && this.state.status !== Status.INITIALIZING)
                            ? 'connected to ' : 'disconnected from ') + this.state.dfAddress + ':' + this.state.dfPort)}
                        items={[
                            { key: 'dfAddress', title: 'DF Host', defVal: this.state.dfAddress, callback: () => this.setState({ reload: true }) },
                            { key: 'dfPort', title: 'DF Port', defVal: this.state.dfPort, callback: () => this.setState({ reload: true }) }
                        ]}
                    />

                    <TTSPlayer
                        audioData={this.state.audioData}
                        onResult={() => console.log("TTS done - TBD")}
                        showDetail={this.props.showDetail}
                    />
                </>
            }
        </>);
    }
}
