const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { HubConnectionBuilder, LogLevel } = require('@microsoft/signalr');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 5000;

// HTTP Server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// SignalR Hub
app.use(express.json()); // JSON body parser middleware

// SignalR negotiation endpoint
app.post('/chatHub/negotiate', (req, res) => {
    res.json({
        url: `http://localhost:${PORT}/chatHub`,
        accessToken: 'your-access-token', // Optional: Provide an access token if needed
    });
});

const hubConnection = new HubConnectionBuilder()
    .withUrl(`http://localhost:${PORT}/chatHub`)
    .configureLogging(LogLevel.Debug)
    .build();

hubConnection.start()
    .then(() => {
        console.log('SignalR hub is connected!');
    })
    .catch(err => console.error(err));

io.on('connection', (socket) => {
    console.log('A client connected');

    // Handle SignalR messages
    hubConnection.on('ReceiveMessage', (user, message) => {
        console.log(`${user}: ${message}`);
        // Broadcast the message to all connected clients
        io.emit('messageReceived', user, message);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});
