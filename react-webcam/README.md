# React Webcam Tutorial

[![NPM](https://img.shields.io/npm/v/@rubenchoi/react-webcam.svg)](https://www.npmjs.com/package/@rubenchoi/react-webcam) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This repository contains the sample codes about React Webcam:

🎸[Ruben Choi's IT Tutorial - React Webcam](https://rubenchoi.tistory.com/59)


## Install

```bash
npm install --save @rubenchoi/react-webcam
```

## Usage

```jsx
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
        <WebcamComponent callback={onStream} />
    </div >
  )
}
```

## License

MIT © [rubenchoi](https://github.com/rubenchoi)
