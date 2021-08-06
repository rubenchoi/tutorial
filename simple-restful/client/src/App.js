import { WebcamComponent } from '@rubenchoi/webcam';
import axios from 'axios';
import './App.css';
import React from 'react';

const BASE_URL = window.location.protocol + '//' + window.location.hostname + ':4000';

function App() {
  const [url,] = React.useState(BASE_URL);
  const [response, setResponse] = React.useState();
  const [sent, setSent] = React.useState();

  const onImage = (imageUrl) => {
    console.log("onImage:", imageUrl);
    axios.post(BASE_URL + "/image",
      JSON.stringify({ imageUrl: imageUrl }),
      { headers: { 'Content-Type': 'application/json' } })
      .then(res => setResponse(JSON.stringify(res.data.boundary)))
      .catch(error => setResponse('' + error))
    setSent(Date.now());
  }

  return (
    <div className="App">
      <WebcamComponent
        onImage={onImage}
        showDetail
      />
      <div style={{ clear: 'both' }}>
        <hr style={{ height: '2em' }} />
        <p>REST API (Sending base64 encoded image): </p>
        <p>{url + '/image'} [sent@{sent}]</p>
        <p></p>
        <hr style={{ width: '25em' }} />
        <p>Response: {response}</p>
      </div>
    </div>
  );
}

export default App;