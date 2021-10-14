import React, { Fragment } from 'react';

export default class TTSPlayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false,
            error: undefined
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.audioData !== prevProps.audioData) {
            this.playTTSAudioData(this.props.audioData);
        }
    }

    playTTSAudioData = (audioData) => {
        if (this.state.isPlaying) {
            console.log("ERROR: audio player is busy!");
            return;
        }

        try {
            console.log("play audioData.length=" + audioData.byteLength);
            if (audioData.byteLength < 50) {
                throw new Error("audio data is empty");
            }

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext.decodeAudioData(audioData,
                (buffer) => {
                    let myBuffer = buffer;
                    this.audioContext.resume();

                    const source = this.audioContext.createBufferSource();
                    source.connect(this.audioContext.destination);
                    source.buffer = myBuffer;
                    // source.playbackRate.value = 1.0;
                    source.start(0);
                    this.setState({ isPlaying: true });
                    source.addEventListener('ended', () => this.onAudioStop());
                }
            );
        } catch (err) {
            this.onAudioStop(err);
        }
    }

    onAudioStop = (err = undefined) => {
        console.log("onAudioStop", err);
        this.lastError = err;
        this.setState({ isPlaying: false });
        this.props.onResult({ type: 'ttsEnd', data: err });
    }

    render() {
        return (<>
        </>);
    }
}
