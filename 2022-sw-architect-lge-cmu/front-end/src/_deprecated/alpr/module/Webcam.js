/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import { Row, Col } from 'reactstrap';

const PAN = 'pan';
const TILT = 'tilt';
const ZOOM = 'zoom';
const FEATURES = [PAN, TILT, ZOOM];
let counter = 0;
let g_stream; //stream state undefined when stopWebcam is invoked during unmount(React hook return)

export const WebcamComponent = (props) => {
  const [camFeatures, setCamFeatures] = useState({ pan: false, tilt: false, zoom: false });
  const [stream, setStream] = useState(undefined);
  const [videoWH, setVideoWH] = useState(undefined);
  const [enableAudio, setEnableAudio] = useState(true);
  const [filename, setFilename] = useState('download');
  const [showCanvas, ] = useState(true);

  const refVideo = useRef(null);
  const refSelectMic = useRef(null);
  const refSelectVideo = useRef(null);
  const refCanvas = useRef(null);
  const refCounter = useRef(null);

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
          // console.log('Skipped Device: ' + device.kind, device && device.label);
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
    g_stream = stream;
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

  const stopWebcam = (s) => {
    try {
      s.getTracks().forEach(m => {
        try {
          m.stop();
        } catch (err) {
          console.log("stopWebcam() error track:", m);
        }
      })
    } catch (err) {
      console.log("stopWebcam() error stream:", s);
    }
  }

  useEffect(() => {
    listDevices();
    startWebcam();
    return () => {
      stopWebcam(g_stream);
    }
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
    const request = e.target.value.split(':')
    const track = stream.getVideoTracks()[0];
    track.applyConstraints({
      width: request[0],
      height: request[1]
    }).then(() => {
      const settings = track.getSettings();
      let msg = (Number(request[0]) === settings.width && Number(request[1]) === settings.height) ? 'changed' : 'not supported - best mached';
      setVideoWH('w: ' + settings.width + ' h: ' + settings.height + '    ' + msg);
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
      a.download = filename + (refCounter.current.checked ? '_' + (counter++) : '') + '.png';;
      document.body.appendChild(a);
      a.click();
    }, 'image/png');
    // const image = canvas.toDataURL('image/jpeg');
    ctx.font = "80px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Downloaded", 0, 70);
  }

  const onImage = () => {
    const canvas = refCanvas.current;
    const ctx = canvas.getContext('2d');
    canvas.width = refVideo.current.videoWidth;
    canvas.height = refVideo.current.videoHeight;
    ctx.drawImage(refVideo.current, 0, 0);
    ctx.font = "30px Arial";
    ctx.fillText("LGE SW Architect 2022", 10, 50);
    const image = canvas.toDataURL('image/jpeg');
    props.onImage(image);
  }

  return (<>
    <video
      ref={refVideo}
      autoPlay
      style={props.showDetail ? { float: 'left', width: '20vw' } : {}}
    />

    <div style={{ display: showCanvas && props.showDetail ? 'block' : 'none' }}>

      <div style={{ float: 'left', width: '20vw', height: '200px', padding: '2em' }}>
        <p style={{ fontSize: '0.8em' }}>{videoWH}</p>
        <select defaultValue='640:480' onChange={(e) => changeSize(e)}>
          <option value='3840:2160'>UHD 4K 3840x2160</option>
          <option value='1920:1080'>FHD 1080p 1920x1080</option>
          <option value='1280:720'>HD 720p 1280x720</option>
          <option value='800:600'>SVGA 800x600</option>
          <option value='640:480'>VGA 640x480</option>
        </select>
        <br />
        {props.onImage ?
          <button onClick={onImage} style={{ marginTop: '1em' }}>Callback</button>
          : <>
            <input type="text" onChange={e => setFilename(e.target.value)} value={filename} />
            <button onClick={download} style={{ marginTop: '1em' }}>Download</button>
            <label style={{ fontSize: '0.8em' }}><input type="checkbox" ref={refCounter} defaultChecked />Auto-Increase</label>
          </>
        }
        <hr />
        <Col>
          <button onClick={() => startWebcam()}>Start</button>
          <button onClick={() => stopWebcam(g_stream)} style={{ marginLeft: '1em' }}>Stop</button>
        </Col>
      </div>

      <div style={{ float: 'left', fontSize: '1em', width: 'fit-content', border: '1px solid gray', padding: '1em' }}>
        <h4>Settings</h4>
        <Row>
          <Col >Mic: </Col>
          <Col>
            <select style={{ float: 'left' }} ref={refSelectMic} onChange={(e) => startWebcam()}></select>
            {props.onMute &&
              <button onClick={onMute} style={{ float: 'left' }}>{enableAudio ? 'MUTE' : 'UNMUTE'}</button>}
          </Col>
          <Col>Video: </Col>
          <Col><select ref={refSelectVideo} onChange={(e) => startWebcam()}></select></Col>
        </Row>
        <Row>
          {getController(PAN)}
          {getController(TILT)}
          {getController(ZOOM)}
        </Row>
      </div>

      <canvas
        ref={refCanvas}
        style={{ position: 'fixed', width: '20vw', bottom: 0, right: 0 }}
      />

      {props.audioTest &&
        <div style={{ clear: 'both' }}>
          <hr />
          <p>Audio Test:</p>
          <iframe
            width="100"
            height="100"
            src="https://www.youtube.com/embed/I6P24OTIeZI"
            title="Audio Test"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
        </div>
      }
    </div>
  </>);
}
