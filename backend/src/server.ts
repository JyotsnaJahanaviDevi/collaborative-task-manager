import app from './app';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeTaskSocket } from './socket/taskSocket';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Initialize socket handlers
initializeTaskSocket(io);

// Make io accessible to routes
app.set('io', io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
