const aedes = require('aedes')()

const PORT_TLS = 1883;
const PORT_HTTP = 8888;


class AedesServer {
    constructor(portHttp = PORT_HTTP, portTls = PORT_TLS) {
        console.log("AedesServer");
        const httpServer = require('http').createServer();
        require('websocket-stream').createServer({ server: httpServer }, aedes.handle);
        httpServer.listen(portHttp, function () {
            console.log('[aedes]http listening on port ' + portHttp);
        })

        const wsServer = require('net').createServer(aedes.handle)
        wsServer.listen(portTls, function () {
            console.log('[aedes]tls listening on port ' + portTls);
        })
    }
}

new AedesServer();
