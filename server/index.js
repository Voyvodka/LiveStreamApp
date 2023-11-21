const http = require('http').createServer();

const io = require('socket.io')(http, {
    corn: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (message) => {
        console.log(message);
        io.emit('message', `${socket.id} said ${message}`);
    });
});

http.listen(8080, () => console.log('listening...'));