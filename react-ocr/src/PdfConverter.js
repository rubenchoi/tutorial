import React, { useState } from 'react';
import { Button, Container, Typography, Grid } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import './PdfConverter.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function PDFConverter({ onImageUrl }) {
    const [pdf, setPdf] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    const handlePdfUpload = (e) => {
        const file = e.target.files[0];
        setPdf(file);
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const nextPage = () => {
        setPageNumber(pageNumber + 1);
    };

    const prevPage = () => {
        setPageNumber(pageNumber - 1);
    };

    const generateImageUrl = async () => {
        if (pdf) {
            const loadingTask = pdfjs.getDocument(URL.createObjectURL(pdf));
            const pdfDocument = await loadingTask.promise;
            const page = await pdfDocument.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const canvasContext = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({
                canvasContext,
                viewport,
            });
            const imageData = canvas.toDataURL('image/png');
            onImageUrl(imageData);
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Display PDF with React-PDF
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        style={{ display: 'none' }}
                        id="upload-button"
                    />
                    <label htmlFor="upload-button">
                        <Button variant="contained" component="span">
                            Upload PDF
                        </Button>
                    </label>
                </Grid>
                <Grid item xs={12}>

                    <p>
                        Page {pageNumber} of {numPages}
                    </p>
                    <Button
                        variant="contained"
                        onClick={prevPage}
                        disabled={pageNumber <= 1}
                    >
                        Previous Page
                    </Button>
                    <Button
                        variant="contained"
                        onClick={nextPage}
                        disabled={pageNumber >= numPages}
                    >
                        Next Page
                    </Button>
                    <Button
                        variant="contained"
                        onClick={generateImageUrl}
                        disabled={!pdf}
                    >
                        Generate Image URL
                    </Button>
                    {pdf && (
                        <Document
                            file={pdf}
                            onLoadSuccess={onDocumentLoadSuccess}
                        >
                            <Page pageNumber={pageNumber} />
                        </Document>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}

export default PDFConverter;
