import { Container } from '@mui/material';
import Page from '../components/Page';
import { AppAlpr } from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  return (
    <Page title="Dashboard" style={{ position: 'relative', height: '100%' }}>
      <Container maxWidth="xl" style={{ border: '0px solid blue', height: '100%' }}>
        <AppAlpr
          title="ALPR Preview"
          subheader="Realtime Video Streaming"
        />
      </Container>
    </Page>
  );
}
