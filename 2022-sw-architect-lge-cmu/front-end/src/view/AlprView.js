/* eslint-disable object-shorthand */
import { IconButton } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Iconify from '../components/Iconify';
import RestApiController from '../controller/RestApiController';
import PlateView from './PlateView';
import Preview from './Preview';

AlprModel.propTypes = {
  showDetail: PropTypes.bool
};

function AlprModel({ showDetail }) {

  const handle = useFullScreenHandle();

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 9, border: '0px solid blue' }}>
      <FullScreen handle={handle}>
        <RestApiController
          showDetail={showDetail}
          fitToWindow
        />
        <PlateView
          showDetail={showDetail}
        />
        <Preview
          showDetail={showDetail}
          fitToWindow
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

export default AlprModel;
