import React, { useEffect, useRef, useState, Fragment } from 'react'
import style from './styles.module.css';

const PAN = 'pan';
const TILT = 'tilt';
const ZOOM = 'zoom';
const FEATURES = [PAN, TILT, ZOOM];

export const WebcamComponent = (props) => {
  const [camFeatures, setCamFeatures] = useState({ pan: false, tilt: false, zoom: false });
  const [stream, setStream] = useState(undefined);
  const [videoWH, setVideoWH] = useState(undefined);
  const [enableAudio, setEnableAudio] = useState(true);

  const refVideo = useRef(null);
  const refSelectMic = useRef(null);
  const refSelectVideo = useRef(null);
  const refCanvas = useRef(null);
  const refVideoSize = useRef(null);

  const listDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    devices.forEach((device) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      switch (device.kind) {
        case 'audioinput':
          option.text = device.label || `mic ${refSelectMic.current.length + 1}`;
          refSelectMic.current.appendChild(option);
          break;
        case 'videoinput':
          option.text = device.label || `camera ${refSelectVideo.current.length + 1}`;
          refSelectVideo.current.appendChild(option);
          break;
        default:
          console.log('Skipped Device: ' + device.kind, device && device.label);
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
    const mediaParams = getParams(refSelectVideo.current.value, refSelectMic.current.value);
    const stream = await navigator.mediaDevices.getUserMedia(mediaParams);

    refVideo.current.srcObject = stream;

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
    setVideoWH('w: ' + settings.width + ' h: ' + settings.height);

    const extraInfo = {
      params: mediaParams,
      videoId: refSelectVideo.current.value,
      audioId: refSelectMic.current.value,
      width: settings.width,
      height: settings.height
    }
    props.onStream && props.onStream(stream, extraInfo);
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
      {feature}: <input name={feature} type="range" disabled />
    </div>)
  }

  const onMute = () => {
    setEnableAudio(!enableAudio);
    props.onMute && props.onMute(enableAudio);
  }

  const changeSize = (e) => {
    const wh = e.target.value.split(':')
    console.log(wh);
    const track = stream.getVideoTracks()[0];
    track.applyConstraints({
      width: wh[0],
      height: wh[1]
    }).then(() => {
      const settings = track.getSettings();
      setVideoWH('w: ' + settings.width + ' h: ' + settings.height);
    })
      .catch(err => console.log(err))
  }

  const download = () => {
    const canvas = refCanvas.current;
    const ctx = canvas.getContext('2d');
    canvas.width = refVideo.current.videoWidth;
    canvas.height = refVideo.current.videoHeight;
    ctx.drawImage(refVideo.current, 0, 0);
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      // a.href.onload = () => {
      //   URL.revokeObjectURL(url);
      // }
      a.download = 'testfile.png';
      document.body.appendChild(a);
      a.click();
    }, 'image/png');
  }

  return (
    <div style={{ display: props.showDetail ? 'block' : 'none' }}>
      <div style={{ fontSize: '1em', width: 'fit-content', border: '1px solid gray' }}>
        <h3>Settings</h3>
        <div className={style.gridContainer}>
          <div className={style.gridItem}>Mic: </div>
          <div className={style.gridItem}>
            <select style={{ float: 'left' }} ref={refSelectMic} onChange={(e) => startWebcam()}></select>
            {props.onMute &&
              <button onClick={onMute} style={{ float: 'left' }}>{enableAudio ? 'MUTE' : 'UNMUTE'}</button>}
          </div>
          <div className={style.gridItem}>Video: </div>
          <div className={style.gridItem}><select ref={refSelectVideo} onChange={(e) => startWebcam()}></select></div>
        </div>
        <div>
          {getController(PAN)}
          {getController(TILT)}
          {getController(ZOOM)}
        </div>
      </div>

      <hr />
      <div style={{ float: 'left' }}>
        <video ref={refVideo} autoPlay style={{ width: '20vw', margin: 'auto' }} />
        <canvas ref={refCanvas} style={{ display: 'none' }} />
      </div>
      <div style={{ float: 'left', padding: '2em' }}>
        <p style={{ fontSize: '0.8em' }}>{videoWH}</p>
        <select defaultValue='640x480' ref={refVideoSize} onChange={(e) => changeSize(e)}>
          <option value='3840:2160'>UHD 4K 3840x2160</option>
          <option value='1920:1080'>FHD 1080p 1920x1080</option>
          <option value='1280:720'>HD 720p 1280x720</option>
          <option value='800:600'>SVGA 800x600</option>
          <option value='640:480'>VGA 640x480</option>
        </select>
        <br /><button onClick={download} style={{ marginTop: '1em' }}>Download</button>
      </div>

      {props.audioTest &&
        <div style={{ clear: 'both' }}>
          <hr />
          <p>Audio Test:</p>
          <iframe
            width="100"
            height="100"
            src="https://www.youtube.com/embed/1Hkc_2b03jw"
            title="Audio Test"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      }
    </div>
  );
}
