import React, { useEffect, useState } from 'react';
import Tesseract, { createWorker } from 'tesseract.js';
import { Button, Container, Typography, TextField, Grid } from '@mui/material';

function OCR({ imageUrl }) {

    const [pdf, setPdf] = useState(null);
    const [text, setText] = useState('');


    // const handlePdfUpload = async (e) => {
    //     const file = e.target.files[0];
    //     setPdf(URL.createObjectURL(file));
    //     await convertPdfToImages(file);
    // };

    // const convertPdfToImages = async (pdfFile) => {
    //     const imagesArray = [];
    //     const pdfjsLib = await import('pdfjs-dist/build/pdf');
    //     const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');

    //     pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    //     const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(pdfFile));
    //     const pdfDocument = await loadingTask.promise;

    //     for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    //         const page = await pdfDocument.getPage(pageNum);
    //         const viewport = page.getViewport({ scale: 1 });
    //         const canvas = document.createElement('canvas');
    //         const canvasContext = canvas.getContext('2d');
    //         canvas.width = viewport.width;
    //         canvas.height = viewport.height;
    //         await page.render({
    //             canvasContext,
    //             viewport,
    //         });
    //         const imageData = canvas.toDataURL('image/png');
    //         imagesArray.push(imageData);
    //     }

    //     setImages(imagesArray);
    // };

    const performOCR = async (imageUrl) => {
        const ocrText = [];
        // console.log(`performOCR ${images.length} images...`, images)
        // for (let i = 0; i < images.length; i++) {
        console.log(`performOCR...`)
        const { data: { text } } = await Tesseract.recognize(
            imageUrl, // images[i],
            'eng',
            { logger: m => console.log(m) }
        );
        ocrText.push(text);
        // }
        console.log(`RESULT...`, ocrText)

        setText(ocrText.join('\n'));
    };

    const createObjectURL = (base64Image) => {
        const byteCharacters = atob(base64Image.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        console.log(`blob`, blob);
        return URL.createObjectURL(blob);
    };

    const processOCR = async (base64Image) => {
        try {
            const byteCharacters = atob(base64Image.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            console.log(`blob`, blob);
            const file = new File([blob], "image"); // Creating a file from blob

            Tesseract.recognize(
                file,
                'eng',
                { logger: m => console.log(m) }
            ).then(({ data: { text } }) => {
                console.log(text);
            }).catch(err => console.error(err));


            // const { data: { text } } = await Tesseract.recognize(file);
            // console.log(`text`, text);
            // setText(text);
        } catch (error) {
            console.error('Error performing OCR:', error);
        }
    };

    useEffect(() => {
        console.log(`extractTextFromImage`);
        const createImageElement = (base64ImageUrl) => {
            const img = new Image();
            img.src = base64ImageUrl;
            return img;
        };

        const extractTextFromImage = async (imageUrl) => {
            const worker = await createWorker('eng', 1, {
                workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js',
                langPath: 'https://tessdata.projectnaptha.com/4.0.0',
                corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0',
            });

            // const img = createImageElement(imageUrl);
            console.log(`extractTextFromImage imageUrl:`, imageUrl);
            const r = await worker.recognize(imageUrl);
            console.log('text', r);

            // setText(text);
            await worker.terminate();
            console.log('done')
        };

        const process = (imageUrl) => {
            console.log('process imageUrl:', imageUrl);

            const img = createImageElement(imageUrl);

            Tesseract.recognize(
                img,
                'eng',
                { logger: m => console.log(m) }
            ).then(({ data: { text } }) => {
                console.log(text);
            }).catch(err => console.error(err));
        }


        if (imageUrl) {
            // process(imageUrl);
            extractTextFromImage(imageUrl);
        }
    }, [imageUrl]);

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                OCR Upload with Material-UI
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                    {/* <input
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
                    </label> */}
                </Grid>
                {pdf && (
                    <Grid item xs={12}>
                        <iframe
                            src={pdf}
                            title="Uploaded PDF"
                            style={{ width: '100%', height: '500px', border: 'none' }}
                        ></iframe>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Button variant="contained" onClick={performOCR} disabled={!pdf}>
                        Perform OCR
                    </Button>
                </Grid>
                {text && (
                    <Grid item xs={12}>
                        <TextField
                            label="Extracted Text"
                            variant="outlined"
                            fullWidth
                            multiline
                            value={text}
                            disabled
                        />
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}

export default OCR;
