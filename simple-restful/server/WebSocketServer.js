const express = require('express');
const app = express();
const socket = require('socket.io');

function initSocketServer() {
    const server = app.listen(7777, function () {
        console.log("Server has started on port 7777");
    });
    io = socket(server);
    io.on('connection', (socket) => {
        console.log(socket.id);

        socket.on('REQUEST', (data) => {
            console.log(data);

            var PythonShell = require('python-shell');
            var options = {
                mode: 'text',
                pythonPath: '',
                pythonOptions: ['-u'],
                scriptPath: '',
                args: ['value1', 'value2', 'value3']
            };
            let pyshell = PythonShell.PythonShell.run('python/final.py', options, function (err, results) {
                if (err) throw err;
                console.log('results: %j', results);
            });
            pyshell.on('message', message => {
                if (message.includes('Neural Network Output')) {
                    console.log(message);
                    socket.emit('FROM_SERVER', { data: message });
                }
            })
        })
    })
}

initSocketServer();