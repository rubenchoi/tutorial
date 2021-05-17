import React from 'react'
import DialogComponent from 'react-app'
import React3D from '@rubenchoi/react3d'
import Draggable from 'react-draggable'
import { Badge, Button } from 'reactstrap'

const Status = {
  INITIALIZING: 'initializing...',
  IDLE: 'idle',
  LISTENING: 'listening...'
}

const App = (props) => {
  const [status, setStatus] = React.useState(Status.INITIALIZING);
  const [enableDF, setEnableDF] = React.useState(false);

  const startDF = () => {
    console.log("startDF");
    setStatus(Status.LISTENING);
    setEnableDF(true);
  }

  const onDFResult = (data) => {
    console.log("onDFResult: ", data);
    setStatus(Status.IDLE);
    setEnableDF(false);
  }

  return (<>
    <React3D />
    <Draggable>
      <div style={{ width: 'fit-content', transform: 'scale(0.7, 0.7)', background: 'rgba(255,255,255,0.3)', margin: '0.5em' }}>
        {status !== Status.LISTENING ?
          <Button color="info" onClick={startDF}>Start DF</Button> :
          <Badge color='warning'>Listening...</Badge>}
        <DialogComponent
          enable={enableDF}
          onResult={onDFResult}
          showDetail={false}
        />
      </div>
    </Draggable>
  </>);
}

export default App
