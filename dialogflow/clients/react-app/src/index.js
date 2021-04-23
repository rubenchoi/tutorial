import React, { Fragment } from 'react'
import DialogflowHandler from './core/DialogflowHandler.js'
import 'bootstrap/dist/css/bootstrap.css';

const DialogComponent = (props) => {
  const [stream, setStream] = React.useState(undefined);

  React.useEffect(() => {
    if (props.stream) {
      setStream(stream);
    } else {
      const createStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setStream(stream);
      }
      createStream();
    }
  }, [])

  return (<>
    {stream ?
      <DialogflowHandler
        stream={stream}
        showDetail={props.showDetail}
      />
      :
      <p>waiting for microphone...</p>
    }
  </>
  )
}

export default DialogComponent;
