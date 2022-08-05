import { WebSocketServer } from 'ws';

export default class EchoServer {
  constructor(port) {
    const wss = new WebSocketServer({
      port: port,
    });

    wss.on('connection', function connection(ws) {
      ws.on('message', function message(data) {
        console.log('received: %s', data);
      });

      ws.send('something');
    });
  }

  debug = m => console.log('[EchoServer]', m);
}
