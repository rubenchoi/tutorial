import React, { useState } from 'react';
import { Button, Container, Typography, Grid } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { v4 as uuidv4 } from 'uuid';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function PdfToImages() {
    const [pdfFiles, setPdfFiles] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);

    const handlePdfUpload = (e) => {
        const files = e.target.files;
        setPdfFiles(Array.from(files));
    };

    const convertPdfToImages = async () => {
        const urls = [];
        for (const pdfFile of pdfFiles) {
            console.log(`doing pdfFile`, pdfFile);
            const loadingTask = pdfjs.getDocument(URL.createObjectURL(pdfFile));
            const pdfDocument = await loadingTask.promise;
            for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
                const page = await pdfDocument.getPage(pageNum);
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
                urls.push(imageData);
            }
        }
        setImageUrls(urls);
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Convert PDFs to Images
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        multiple
                        style={{ display: 'none' }}
                        id="upload-button"
                    />
                    <label htmlFor="upload-button">
                        <Button variant="contained" component="span">
                            Upload PDFs
                        </Button>
                    </label>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        onClick={convertPdfToImages}
                        disabled={pdfFiles.length === 0}
                    >
                        Convert to Images
                    </Button>
                </Grid>
                {imageUrls.map((url, index) => (
                    <Grid item xs={12} key={uuidv4()}>
                        <img src={url} alt={`Page ${index + 1}`} style={{ width: '100%' }} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default PdfToImages;
