const { Server } = require('socket.io');

class SocketServer {
  constructor() {
    this.io = null;
  }

  initialize(httpServer) {
    const allowedOrigins = [
      process.env.CLERK_ORIGIN || 'http://localhost:3001',
      process.env.DASHBOARD_URL || 'http://localhost:3001',
      'https://bingo-ai-app.vercel.app',
    ].filter(Boolean);

    this.io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEvents();
    console.log('[Socket.io] Server initialized');
    return this.io;
  }

  setupMiddleware() {
    this.io.use((socket, next) => {
      socket.agentId = socket.handshake.auth?.agentId || socket.handshake.query?.agentId || 'anonymous';
      socket.orgId = socket.handshake.auth?.orgId || socket.handshake.query?.orgId || 'unknown';
      next();
    });
  }

  setupEvents() {
    this.io.on('connection', (socket) => {
      console.log(`[Socket.io] connected: ${socket.id} agent=${socket.agentId} org=${socket.orgId}`);

      if (socket.agentId !== 'anonymous') socket.join(`agent_${socket.agentId}`);
      if (socket.orgId !== 'unknown') socket.join(`org_${socket.orgId}`);

      socket.on('join_call', ({ callId }) => {
        if (!callId) return;
        socket.join(`call_${callId}`);
        socket.emit('joined', { callId });
        console.log(`[Socket.io] ${socket.id} joined call_${callId}`);
      });

      socket.on('leave_call', ({ callId }) => {
        if (callId) socket.leave(`call_${callId}`);
      });

      socket.on('disconnect', (reason) => {
        console.log(`[Socket.io] disconnected: ${socket.id} (${reason})`);
      });
    });
  }

  emitTranscriptUpdate(callId, segment) {
    this.io?.to(`call_${callId}`).emit('transcript_update', segment);
  }

  emitNewHint(callId, hint) {
    this.io?.to(`call_${callId}`).emit('new_hint', hint);
  }

  emitSentimentUpdate(callId, score) {
    this.io?.to(`call_${callId}`).emit('sentiment_update', { score });
  }

  emitCallStatusChange(callId, status) {
    this.io?.to(`call_${callId}`).emit('call_status', { status });
  }

  emitUtteranceComplete(callId, data) {
    this.io?.to(`call_${callId}`).emit('utterance_complete', data);
  }

  getIo() {
    return this.io;
  }
}

const socketServer = new SocketServer();
module.exports = { socketServer };
