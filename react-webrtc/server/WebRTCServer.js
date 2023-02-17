import { WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';
import https from 'https';
import cors from 'cors';
import path from 'path';

const DEFAULT_PORT_HTTP = 8080;
const DEFAULT_PORT_HTTPS = 8081;

export default class WebRTCServer {
  constructor(tlsOption, portHttp = DEFAULT_PORT_HTTP, portHttps = DEFAULT_PORT_HTTPS) {
    this.portHttp = portHttp;
    this.portHttps = portHttps;

    this.sockets = {};

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    app.get("/", (req, res) => {
      res.sendFile(path.join(path.resolve() + '/static/webrtc.html'));
    });
    app.use(express.static('static'));

    app.get('/webrtc/connections', (req, res) => {
      try {
        res.send(JSON.stringify(Object.keys(this.sockets), null, 2));
      } catch (err) {
        res.send("no data(or error)");
        console.error(err);
      }
    });

    const httpServer = http.createServer(app);
    const websocketServer = new WebSocketServer({ server: httpServer });
    websocketServer.on('connection', this.websocketHandler);
    httpServer.listen(this.portHttp, () => console.log('HTTP Server on ' + this.portHttp));

    if (tlsOption) {
      console.log(`TLS ${this.portHttps} enabled`);
      const httpsServer = https.createServer(tlsOption, app);
      const websocketServerSecure = new WebSocketServer({ server: httpsServer });
      websocketServerSecure.on('connection', this.websocketHandler);
      httpsServer.listen(this.portHttps, () => console.log('HTTPS Server on ' + this.portHttps));
    } else {
      console.log(`TLS ${this.portHttps} disabled`);
    }
  }

  websocketHandler = (websocket,) => {
    console.log('---new connection---');
    this.incomingSocket = websocket;
    websocket.on('message', msg => this.onMessage(msg, websocket));
    websocket.on('error', e => console.error(e));
    websocket.on('close', e => {
      const key = Object.keys(this.sockets).find(key => this.sockets[key] === websocket);
      delete this.sockets[key];
      console.log(`closed connectionId ${key}`);
    });
  }

  onMessage = (m, websocket) => {
    try {
      const msg = JSON.parse(m);
      console.log(`----------------------Received: ${msg.type}`);
      switch (msg.type) {
        case 'connect':
          if (this.sockets[msg.connectionId] !== undefined) {
            const reason = `${msg.connectionId} already exists!`
            console.error(reason);
            websocket.send(JSON.stringify({ type: "error", connectionId: msg.connectionId, reason: reason }))
            return;
          }
          this.sockets[msg.connectionId] = websocket;
          console.log(`added ${msg.connectionId} to connections`);
          websocket.send(JSON.stringify({ type: "connect", connectionId: msg.connectionId }))
          break;
        case 'disconnect':
          delete this.sockets[msg.connectionId];
          console.log(`removed ${msg.connectionId} from connections`);
          websocket.send(JSON.stringify({ type: "disconnect", connectionId: msg.connectionId }))
          break;
        case 'offer':
          this.broadcast(JSON.stringify(msg), msg.from);
          break;
        case 'answer':
          if (this.sockets[msg.to] === undefined) {
            const reason = `no target [${msg.to}] to answer!`;
            console.error(reason);
            websocket.send(JSON.stringify({ type: "error", connectionId: msg.connectionId, reason: reason }))
            return;
          }
          this.sockets[msg.to].send(JSON.stringify(msg));
          break;
        case 'candidate':
          this.broadcast(JSON.stringify(msg), msg.from);
          break;
        default:
          console.error(`ERROR: invalid message : ${msg.type}`);
          break;
      }
    } catch (err) {
      console.error(err);
    }
  }

  broadcast = (m, myId) => {
    for (let key in this.sockets) {
      if (key !== myId) {
        console.log(`==> broadcast to ${key}`);
        this.sockets[key].send(m);
      }
    }
  }
}