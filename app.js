const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

// Create an HTTP server
const server = http.createServer(app);
const io = socketio(server);

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle socket connections
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Listen for location updates from the client
    socket.on('send-location', (data) => {
        console.log(`Received location from ${socket.id}:`, data);
        // Broadcast the location data to all connected clients
        io.emit('receive-location', { id: socket.id, ...data });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        // Notify all clients that the user has disconnected
        io.emit('user-disconnected', socket.id);
    });
});

// Render the index.ejs file for the root route
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server started on port 3000');
});
