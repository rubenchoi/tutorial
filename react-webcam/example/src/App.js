import React from 'react'
import { WebcamComponent } from '@rubenchoi/webcam';

import '@rubenchoi/webcam/dist/index.css'

const App = () => {
  const onStream = (stream) => {
    console.log(stream);
  }

  const onMute = (muted) => {
    console.log(muted ? 'muted' : 'unmuted');
  }

  return (
    <div>
      <h2>React App Webcam Test</h2>
      <hr />
      <div style={{ width: '40vw', margin: '1em' }}>
        <WebcamComponent onStream={onStream} onMute={onMute} audioTest={true} />
      </div>
    </div >
  )
}

export default App
