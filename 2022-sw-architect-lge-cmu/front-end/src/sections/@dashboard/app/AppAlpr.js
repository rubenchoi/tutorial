import { Box, Card, CardHeader } from '@mui/material';
import PropTypes from 'prop-types';
import AlprModel from '../../../view/AlprView';
// ----------------------------------------------------------------------

AppAlpr.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function AppAlpr({ title, subheader, ...other }) {
  return (<>
    <Card {...other} style={{ border: '0px solid green', height: '100%' }}>
      {/* <CardHeader title={title} subheader={subheader} /> */}
      <Box sx={{ p: 3, pb: 1 }} dir="ltr" style={{ border: '0px solid red', height: '100%' }}>
        <AlprModel showDetail />
      </Box>
    </Card>
  </>);
}
