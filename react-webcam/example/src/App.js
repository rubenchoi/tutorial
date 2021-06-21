import React from 'react'
import { WebcamComponent } from '@rubenchoi/react-webcam';

import '@rubenchoi/react-webcam/dist/index.css'

const App = () => {
  const onStream = (stream) => {
    console.log(stream);
  }
  return (
    <div>
      <h2>React App Webcam Test</h2>
      <div style={{ position: 'absolute', top: '20%', left: '20%', border: '2px solid green', padding: '1em' }}>
        <WebcamComponent callback={onStream} />
      </div>
    </div >
  )
}

export default App
