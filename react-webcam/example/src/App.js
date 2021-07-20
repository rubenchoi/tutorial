import React from 'react'
import { WebcamComponent } from '@rubenchoi/webcam';

import '@rubenchoi/webcam/dist/index.css'

const App = () => {
  const [showDetail, setShowDetail] = React.useState(true);

  const onStream = (stream, mediaParams) => {
    console.log(stream, mediaParams);
  }

  const onMute = (muted) => {
    console.log(muted ? 'muted' : 'unmuted');
  }

  return (
    <div>
      <h2>React App Webcam Control</h2>
      <hr />
      <button onClick={() => setShowDetail(!showDetail)}>{showDetail ? 'Hide' : 'Show'}</button>
      <div style={{ width: '40vw', margin: '1em' }}>
        <WebcamComponent onStream={onStream} onMute={onMute} audioTest showDetail={showDetail} />
      </div>
    </div >
  )
}

export default App
