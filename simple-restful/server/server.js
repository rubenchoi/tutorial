import { PythonShell } from 'python-shell';
import express from 'express';
import cors from 'cors';

const PORT = 4000;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

app.post('/image', (req, res) => {
    console.log("POST/image requested. Received data length=", req.body.imageUrl.length);

    let data;
    const pyshell = new PythonShell('./test.py');
    pyshell.send(req.body.imageUrl);
    pyshell.on('message', (message) => data = message);
    pyshell.end((err, code, signal) => res.status(err ? 500 : 200).send(data));

})

app.listen(PORT, () => {
    console.log("Server is running at port " + PORT);
})

