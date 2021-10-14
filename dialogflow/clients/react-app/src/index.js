import 'bootstrap/dist/css/bootstrap.css';
import React, { Fragment } from 'react';
import { Button } from 'reactstrap';
import DialogflowHandler from './core/DialogflowHandler.js';
import TTSHandler from './core/TTSHandler.js';

const DialogComponent = (props) => {
  const [stream, setStream] = React.useState(undefined);
  const [showChat, setShowChat] = React.useState(false);

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

  //Recommended parent div style : <div background: 'rgba(255,255,255,0.3)', width: 'fit-content' }}>
  return (
    <>
      {stream ?
        <DialogflowHandler
          stream={stream}
          showDetail={props.showDetail}
        />
        :
        <p>waiting for microphone...</p>
      }

      <TTSHandler
        showDetail={true}
      />

      {props.showDetail &&
        <div style={{ margin: '1em' }}>
          <Button onClick={() => setShowChat(!showChat)} color={showChat ? 'warning' : 'primary'}>
            {showChat ? 'Hide WebDemo' : 'Show WebDemo'}
          </Button>
          {showChat &&
            <div>
              <iframe
                allow="microphone;"
                width="350"
                height="430"
                src="https://console.dialogflow.com/api-client/demo/embedded/ee3a2cad-4346-436e-aeb0-e19379dd2966">
              </iframe>
            </div>
          }
        </div>
      }
    </>
  )
}

export default DialogComponent;
