# Notice

This project has been deprecated.

Please see [React Metaverse Library](https://www.npmjs.com/package/react-metaverse) instead. 


# React 3D

[![NPM](https://img.shields.io/npm/v/react3d.svg)](https://www.npmjs.com/package/@rubenchoi/react3d) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

React 3D library using three.js

### Feature:
- Setting menu included (to change character and background image).
- Sample app and assets(CC0 public domain) are included.

<img src="https://user-images.githubusercontent.com/49624697/115985163-8311ae80-a5e5-11eb-9a0d-4980026cc72a.png" width="400px">

## Install

```bash
npm install --save @rubenchoi/react3d
```

## Usage

```jsx
import React, { Fragment } from 'react'
import React3DComponent from '@rubenchoi/react3d'

export default const App = () => {
  return (<>
    <div style={{ width: '100vw', height: '100vh', overflow: "hidden" }}>
      <React3DComponent showDetail={true} specs={Specs}/>
    </div>
  </>);
}
```

### About Specs:

Specs defines the specifications of 3D characters. 
Specs should have the following parameters:
- info: used for showing options in DropDown button to select character
- default: default character to be loaded at the beginning

```jsx
Spec.info = [
    { title: 'Meta Woman(GLB)', spec: MetaWoman },
    { title: 'Dummy', spec: Dummy },
]
Spec.default = Spec.MetaWoman;
```

Each spec should have following parameters:

```jsx
export const Dummy = {
    name: 'Dummy',
    filepath: BASE_DIR + 'sample.fbx',
    scale: 0.02,
    animations: []
}
```

where BASE_DIR should refer some folder under public/ such as:
```jsx
const BASE_DIR = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/character/';
```

Please see the example codes for more details.

## Sample App

Sample app and 3D assets are located in [example](/example) folder.

```bash
~$ npm install 
~/example$ npm install && npm start
```

## Assets

- [example/public/character/](/3d) : self-created 3D models under CC0 public domain license
- [example/public/hdri](/example/public/hdri) : CC0 HDRI images from [HDRIHaven](https://hdrihaven.com/)

