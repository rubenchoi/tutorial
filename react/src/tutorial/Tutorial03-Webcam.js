import React from 'react';
import { Button, Nav, NavItem, NavLink } from 'reactstrap';

const getWebcam = (callback) => {
  try {
    const constraints = {
      'video': true,
      'audio': false
    }
    navigator.mediaDevices.getUserMedia(constraints)
      .then(callback);
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

const Styles = {
  Video: { width: "100%", height: "100%", background: 'rgba(245, 240, 215, 0.5)' },
  None: { display: 'none' },
}

function TestWebcam() {
  const [playing, setPlaying] = React.useState(undefined);

  const videoRef = React.useRef(null);

  React.useEffect(() => {
    getWebcam((stream => {
      setPlaying(true);
      videoRef.current.srcObject = stream;
    }));
  }, []);

  const startOrStop = () => {
    if (playing) {
      const s = videoRef.current.srcObject;
      s.getTracks().forEach((track) => {
        track.stop();
      });
    } else {
      getWebcam((stream => {
        setPlaying(true);
        videoRef.current.srcObject = stream;
      }));
    }
    setPlaying(!playing);
  }

  return (<>
    <div style={{ width: '100vw', height: '100vh', padding: '3em' }}>
      <video ref={videoRef} autoPlay style={Styles.Video} />
      <Button color="warning" onClick={() => startOrStop()}>{playing ? 'Stop' : 'Start'} </Button>
    </div >
    <hr />
    <Nav pills>
      <NavItem>
        <NavLink href="https://rubenchoi.tistory.com/20" active target='_blank'>[Tutorial] React 웹캠 - 2. getUserMedia</NavLink>
      </NavItem>
    </Nav>
  </>);
}

export default TestWebcam;
