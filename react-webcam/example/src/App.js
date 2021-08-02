import React from 'react'
import { WebcamComponent } from '@rubenchoi/webcam';

import '@rubenchoi/webcam/dist/index.css'

const App = () => {
  const [showDetail, setShowDetail] = React.useState(true);
  const [hideVideo,] = React.useState(false);
  const [mount, setMount] = React.useState(false);

  const onStream = (stream, mediaParams) => {
    console.log(stream, mediaParams);
  }

  const onMute = (muted) => {
    console.log(muted ? 'muted' : 'unmuted');
  }

  return (
    <div style={{ width: '90%', margin: 'auto' }}>
      <h2>React App Webcam Control</h2>
      <button onClick={() => setShowDetail(!showDetail)}>{showDetail ? 'Hide' : 'Show'}</button>
      <button onClick={() => setMount(!mount)}>{mount ? 'Disable' : 'Enable'}</button>
      <hr />

      {mount &&
        <WebcamComponent
          onStream={onStream}
          onMute={onMute}
          audioTest
          showDetail={showDetail}
          hideVideo={hideVideo}
        />
      }
    </div>
  )
}

export default App
