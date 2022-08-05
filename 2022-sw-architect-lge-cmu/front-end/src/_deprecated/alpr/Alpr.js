/* eslint-disable object-shorthand */
/* eslint-disable react/jsx-boolean-value */
import { IconButton } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Iconify from '../../components/Iconify';
import { Preview } from './module/PreviewV1';
import RestApiComponent from './module/RestApiV1';

function Alpr(props) {
  const [request, setRequest] = useState(undefined);
  const handle = useFullScreenHandle();

  function handleFoundPlateNumber(keyword){
    setRequest({ type: 'search', keyword: keyword });
  }

  useEffect(() => {
    console.log("props.request", request);
    setRequest(props.request);
  }, [props.request])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', border: '0px solid gray' }}>
      <FullScreen handle={handle}>
        <Preview
          showDetail={true}
          fitToWindow={true}
          onFoundPlate={keyword => handleFoundPlateNumber(keyword)}
        />
        <RestApiComponent
          showDetail={true}
          fitToWindow={true}
          request={request}
        />
      </FullScreen>

      <div style={{ position: 'fixed', bottom: 20, right: 10, zIndex: 9 }}>
        <IconButton onClick={handle.enter}>
          <Iconify icon="map:fullscreen" />
        </IconButton>
      </div>
    </div>
  );
}

export default Alpr;
