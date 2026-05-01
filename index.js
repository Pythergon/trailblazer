const express = require('express');
const { Socket } = require('node:dgram');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000
const PublicIp = '10.0.0.200'

app.get('/', (req, res) => {
//   res.send('<h1>Hello world</h1>');
    res.sendFile(join(__dirname, 'index.html'))
});

io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg)
    });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`server running at http://${PublicIp}:3000`);
});