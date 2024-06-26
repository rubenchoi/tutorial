import { Box, Button, LinearProgress, TextField, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.worker.js";

const language = localStorage.getItem("language") ?? "eng";
const languages = [
    { name: "English", code: "eng" },
    { name: "Portuguese", code: "por" },
    { name: "Afrikaans", code: "afr" },
    { name: "Albanian", code: "sqi" },
    { name: "Amharic", code: "amh" },
    { name: "Arabic", code: "ara" },
    { name: "Assamese", code: "asm" },
    { name: "Azerbaijani", code: "aze" },
    { name: "Azerbaijani - Cyrillic", code: "aze_cyrl" },
    { name: "Basque", code: "eus" },
    { name: "Belarusian", code: "bel" },
    { name: "Bengali", code: "ben" },
    { name: "Bosnian", code: "bos" },
    { name: "Bulgarian", code: "bul" },
    { name: "Burmese", code: "mya" },
    { name: "Catalan; Valencian", code: "cat" },
    { name: "Cebuano", code: "ceb" },
    { name: "Central Khmer", code: "khm" },
    { name: "Cherokee", code: "chr" },
    { name: "Chinese - Simplified", code: "chi_sim" },
    { name: "Chinese - Traditional", code: "chi_tra" },
    { name: "Croatian", code: "hrv" },
    { name: "Czech", code: "ces" },
    { name: "Danish", code: "dan" },
    { name: "Dutch; Flemish", code: "nld" },
    { name: "Dzongkha", code: "dzo" },
    { name: "English, Middle (1100-1500)", code: "enm" },
    { name: "Esperanto", code: "epo" },
    { name: "Estonian", code: "est" },
    { name: "Finnish", code: "fin" },
    { name: "French", code: "fra" },
    { name: "French, Middle (ca. 1400-1600)", code: "frm" },
    { name: "Galician", code: "glg" },
    { name: "Georgian", code: "kat" },
    { name: "German", code: "deu" },
    { name: "German Fraktur", code: "frk" },
    { name: "Greek, Modern (1453-)", code: "ell" },
    { name: "Greek, Ancient (-1453)", code: "grc" },
    { name: "Gujarati", code: "guj" },
    { name: "Haitian; Haitian Creole", code: "hat" },
    { name: "Hebrew", code: "heb" },
    { name: "Hindi", code: "hin" },
    { name: "Hungarian", code: "hun" },
    { name: "Icelandic", code: "isl" },
    { name: "Indonesian", code: "ind" },
    { name: "Inuktitut", code: "iku" },
    { name: "Irish", code: "gle" },
    { name: "Italian", code: "ita" },
    { name: "Japanese", code: "jpn" },
    { name: "Javanese", code: "jav" },
    { name: "Kannada", code: "kan" },
    { name: "Kazakh", code: "kaz" },
    { name: "Kirghiz; Kyrgyz", code: "kir" },
    { name: "Korean", code: "kor" },
    { name: "Kurdish", code: "kur" },
    { name: "Lao", code: "lao" },
    { name: "Latin", code: "lat" },
    { name: "Latvian", code: "lav" },
    { name: "Lithuanian", code: "lit" },
    { name: "Macedonian", code: "mkd" },
    { name: "Malay", code: "msa" },
    { name: "Malayalam", code: "mal" },
    { name: "Maltese", code: "mlt" },
    { name: "Marathi", code: "mar" },
    { name: "Nepali", code: "nep" },
    { name: "Norwegian", code: "nor" },
    { name: "Oriya", code: "ori" },
    { name: "Panjabi; Punjabi", code: "pan" },
    { name: "Persian", code: "fas" },
    { name: "Polish", code: "pol" },
    { name: "Pushto; Pashto", code: "pus" },
    { name: "Romanian; Moldavian; Moldovan", code: "ron" },
    { name: "Russian", code: "rus" },
    { name: "Sanskrit", code: "san" },
    { name: "Serbian", code: "srp" },
    { name: "Serbian - Latin", code: "srp_latn" },
    { name: "Sinhala; Sinhalese", code: "sin" },
    { name: "Slovak", code: "slk" },
    { name: "Slovenian", code: "slv" },
    { name: "Spanish; Castilian", code: "spa" },
    { name: "Swahili", code: "swa" },
    { name: "Swedish", code: "swe" },
    { name: "Syriac", code: "syr" },
    { name: "Tagalog", code: "tgl" },
    { name: "Tajik", code: "tgk" },
    { name: "Tamil", code: "tam" },
    { name: "Telugu", code: "tel" },
    { name: "Thai", code: "tha" },
    { name: "Tibetan", code: "bod" },
    { name: "Tigrinya", code: "tir" },
    { name: "Turkish", code: "tur" },
    { name: "Uighur; Uyghur", code: "uig" },
    { name: "Ukrainian", code: "ukr" },
    { name: "Urdu", code: "urd" },
    { name: "Uzbek", code: "uzb" },
    { name: "Uzbek - Cyrillic", code: "uzb_cyrl" },
    { name: "Vietnamese", code: "vie" },
    { name: "Welsh", code: "cym" },
    { name: "Yiddish", code: "yid" },
];

function PdfOcr() {

    const [inProgress, setInProgress] = useState(false);

    const [text, setText] = useState('');

    const canvasRef = useRef();

    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("loadend", (event) =>
                resolve(new Uint8Array(event.target.result))
            );
            reader.readAsArrayBuffer(file);
        });
    };

    const convertToImage = async (pdf) => {
        const images = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1.0 });
            canvasRef.current.height = viewport.height;
            canvasRef.current.width = viewport.width;
            await page.render({
                canvasContext: canvasRef.current.getContext("2d"),
                viewport: viewport,
            }).promise;
            images.push(canvasRef.current.toDataURL("image/png"));
        }
        return images;
    };

    const convertToText = async (images) => {
        const worker = await Tesseract.createWorker();
        // await worker.loadLanguage(language);
        // await worker.initialize(language);

        for (const image of images) {
            const {
                data: { text },
            } = await worker.recognize(image);
            // const section = document.createElement("section");
            // const pre = document.createElement("pre");
            // pre.appendChild(document.createTextNode(text));
            // section.appendChild(pre);
            // resultRef.current.appendChild(section);
            setInProgress(false);
            setText(text);
        }

        await worker.terminate();
    };

    const loadFile = async (file) =>
        window.pdfjsLib.getDocument({ data: file }).promise;

    const convertFile = async (file) => {
        showLoading();
        const pdf = await loadFile(file);
        const images = await convertToImage(pdf);
        await convertToText(images);
        hideLoading();
    };

    const showLoading = () =>
        // (document.getElementById("loading").style.display = "block");
        console.log("showLoading")

    const hideLoading = () =>
        // (document.getElementById("loading").style.display = "none");
        console.log("hideLoading")

    const showError = (error) =>
        console.log("showError", error)
    // document
    //     .getElementById("error")
    //     .appendChild(document.createTextNode(`Error: ${error.message}`));

    const clearResults = () => {
        console.log("clearResults")
        // ["container", "loading", "error"].forEach((id) => {
        //     let element = document.getElementById(id);
        //     element.remove();
        //     element = document.createElement("div");
        //     element.id = id;
        //     if (id === "loading") {
        //         element.appendChild(document.createTextNode("Loading..."));
        //     }
        //     document.body.appendChild(element);
        // });
    };

    // const languageSelect = document.getElementById("language-select");
    // languages.forEach((lang) => {
    //     const option = document.createElement("option");
    //     option.appendChild(document.createTextNode(lang.name));
    //     option.value = lang.code;
    //     languageSelect.appendChild(option);
    // });

    // languageSelect.value = language;
    // languageSelect.addEventListener("change", (event) => {
    //     language = event.target.value;
    //     localStorage.setItem("language", language);
    // });

    // const fileInput = document.getElementById("upload-button");
    // fileInput.addEventListener("change", async () => {
    //     clearResults();
    //     try {
    //         await convertFile(await readFile(fileInput.files[0]));
    //     } catch (error) {
    //         hideLoading();
    //         showError(error);
    //     }
    // });

    const handlePdfUpload = async (e) => {
        clearResults();
        try {
            setInProgress(true);
            await convertFile(await readFile(e.target.files[0]));
        } catch (error) {
            hideLoading();
            showError(error);
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', m: 2, p: 4, border: '5px solid #6ba9ff', borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
                OCR
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '50%', flexShrink: 1, border: '0px solid gray' }} >
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
                    <canvas ref={canvasRef} sx={{ maxWidth: '40vw' }} />
                </Box>
                <Box sx={{ flexGrow: 1, flexShrink: 0, bgcolor: 'white' }} >
                    {inProgress ?
                        <>
                            <LinearProgress /><Typography variant='h3' color="#6ba9ff">Recognizing...</Typography>
                        </>
                        :
                        <TextField
                            label="Extracted Text"
                            variant="outlined"
                            fullWidth
                            multiline
                            value={text}
                            disabled
                        />
                    }
                </Box>
            </Box>
        </Box>
    );
}

export default PdfOcr;
