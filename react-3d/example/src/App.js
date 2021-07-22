import React, { Fragment } from 'react'
import React3DComponent from '@rubenchoi/react3d'
import * as Icon from 'react-feather';
import Specs from './spec/index.js';

const App = () => {
  const [show, setShow] = React.useState(true);

  return (<>
    <div style={{ width: '100vw', height: '100vh', overflow: "hidden", border: "1px dotted gray" }}>
      <React3DComponent showDetail={show} specs={Specs} />
    </div>

    <div style={{ position: 'absolute', right: 3, top: 0 }}>
      <div style={{ fontSize: '0.5em' }} onClick={() => setShow(!show)}>
        {show ? <Icon.EyeOff color='gray' size={24} /> : <Icon.Settings color='orange' size={24} />}
      </div>
    </div>
  </>);
}

export default App
