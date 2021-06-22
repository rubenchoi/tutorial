# React library for Webcam Selection

[![NPM](https://img.shields.io/npm/v/@rubenchoi/webcam.svg)](https://www.npmjs.com/package/@rubenchoi/webcam) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

React library for Webcam Selection. 
Please see [document](https://rubenchoi.tistory.com/entry/React-%EC%9B%B9%EC%BA%A0-4-Select-webcam?category=467530) for further information. 
This project is created using [create-react-library](https://www.npmjs.com/package/create-react-library).

## Install

```bash
npm install --save @rubenchoi/webcam
```

## Usage

```jsx
import React from 'react'
import { WebcamComponent } from '@rubenchoi/webcam';
import '@rubenchoi/webcam/dist/index.css'

const App = () => {
  const onStream = (stream) => console.log(stream);

  const onMute = (muted) => console.log(muted ? 'muted' : 'unmuted')

  return (
    <div>
      <h2>React App Webcam Test</h2>
      <div style={{ width: '40vw', margin: '1em' }}>
        <WebcamComponent onStream={onStream} onMute={onMute} audioTest={true} />
      </div>
    </div >
  )
}

export default App
```

## License

MIT © [rubenchoi](https://github.com/rubenchoi)
