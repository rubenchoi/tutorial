import { useState } from 'react';
import './App.css';
import PdfOcr from './PdfOcr';

function App() {
  const [imageUrl, setImageUrl] = useState(undefined);

  // useEffect(() => {
  //   console.log(`-----------imageUrl`, imageUrl);
  // }, [imageUrl]);

  return (<>
    {/* <OCR imageUrl={imageUrl} />
    <PDFConverter onImageUrl={setImageUrl} /> */}
    <PdfOcr />
  </>);
}

export default App;
