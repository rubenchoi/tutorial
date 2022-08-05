import { BaseOptionChartStyle } from './components/chart/BaseOptionChart';
import ScrollToTop from './components/ScrollToTop';
import Router from './routes';
import ThemeProvider from './theme';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <ThemeProvider>
      <ScrollToTop />
      <BaseOptionChartStyle />
      <Router />
    </ThemeProvider>
  );
}
