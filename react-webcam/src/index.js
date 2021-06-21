import React, { useEffect, useRef, useState } from 'react'
import style from './styles.module.css';

const MIC = 'mic';
const VIDEO = 'video';
const PAN = 'pan';
const TILT = 'tilt';
const ZOOM = 'zoom';
const FEATURES = [PAN, TILT, ZOOM];

export const WebcamComponent = (props) => {
  const [camFeatures, setCamFeatures] = useState({ pan: false, tilt: false, zoom: false });
  const [stream, setStream] = useState(undefined);
  const [enableAudio, setEnableAudio] = useState(true);

  const videoRef = props.videoRef ? props.videoRef : useRef(null);
  const refMic = useRef(null);
  const refVideo = useRef(null);

  const listDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    console.log(devices);

    devices.forEach((device) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      switch (device.kind) {
        case 'audioinput':
          option.text = device.label || `mic ${refMic.current.length + 1}`;
          refMic.current.appendChild(option);
          break;
        case 'videoinput':
          option.text = device.label || `camera ${refVideo.current.length + 1}`;
          refVideo.current.appendChild(option);
          break;
        default:
          console.log('Unsupported device : ' + device.kind, device && device.label);
          break;
      }
    });
  }

  const getParams = (video, audio) => {
    return {
      video: {
        deviceId: video ? { exact: video } : undefined,
        pan: true,
        tilt: true,
        zoom: true
      },
      audio: {
        deviceId: audio ? { exact: audio } : undefined,
        options: {
          muted: true,
          mirror: true
        }
      }
    }
  }

  const startWebcam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(getParams(refVideo.current.value, refMic.current.value));

    videoRef.current.srcObject = stream;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();

    const r = {};
    FEATURES.forEach(feature => {
      r[feature] = feature in settings;

      if (r[feature]) {
        const input = document.querySelector(`input[name=${feature}]`);
        input.min = capabilities[feature].min;
        input.max = capabilities[feature].max;
        input.step = capabilities[feature].step;
        input.value = settings[feature];
        input.disabled = false;
        input.oninput = async () => {
          try {
            const constraints = { advanced: [{ [feature]: input.value }] };
            await track.applyConstraints(constraints);
          } catch (err) {
            console.log(err);
          }
        };
      }
    });
    setCamFeatures(r);

    setStream(stream);
    props.onStream && props.onStream(stream);
  }

  useEffect(() => {
    listDevices();
    startWebcam();
  }, []);

  useEffect(() => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = enableAudio;
    }
  }, [enableAudio])

  const getController = (feature) => {
    let enabled = camFeatures[feature];
    return (<div style={{ display: enabled ? 'inline-block' : 'none' }}>
      * {feature}: <input name={feature} type="range" disabled />
    </div>)
  }

  return (
    <div>
      <p>Settings</p>
      <div className={style.gridContainer}>
        <div className={style.gridItem}>Mic: </div>
        <div className={style.gridItem}>
          <span><select ref={refMic} onChange={(e) => startWebcam()}></select></span>
          <button onClick={() => setEnableAudio(!enableAudio)} style={{ marginLeft: '2em' }}>{enableAudio ? 'MUTE' : 'UNMUTE'}</button>
        </div>
        <div className={style.gridItem}>Video: </div>
        <div className={style.gridItem}><select ref={refVideo} onChange={(e) => startWebcam()}></select></div>
      </div>
      {getController(PAN)}
      {getController(TILT)}
      {getController(ZOOM)}

      <div className={style.gridContainer}>
        <div className={style.gridItem}>
          <video ref={videoRef} playsInline autoPlay style={{ width: '20vw' }}></video>
        </div>
        <div className={style.gridItem}>
          <p>Audio Test:</p>
          <iframe
            width="100"
            height="100"
            src="https://www.youtube.com/embed/1Hkc_2b03jw"
            title="Audio Test"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      </div >
    </div>
  );
}
