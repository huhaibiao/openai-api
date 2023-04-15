/*
 * @Author: huhaibiao huhaibiao@do-global.com
 * @Date: 2023-04-13 02:18:02
 */
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('Hello, welcome to WebSocket server!');
});