import React from 'react';
import { Button } from 'reactstrap';
import Viewer from '../viewer/Viewer.js';

function AndroidApp() {
  const [choice, setChoice] = React.useState(undefined);
  return (
    <div style={{ height: '90vh', width: '100wv', background: 'yellow', border: '1px solid red' }}>
      {!choice ?
        <div style={{ padding: '2em', border: '1px solid black' }}>
          <Button style={{ margin: '1em' }} onClick={() => setChoice('viewer')}>3D Viewer</Button>
        </div>
        : (choice === 'viewer' && <Viewer />)
        // || (choice === 'admin' && <Admin />)
      }
    </div>
  );
}

export default AndroidApp;
