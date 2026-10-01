require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/error');

const eventsRoute = require('./routes/events');
const rsvpsRoute = require('./routes/rsvps');
const usersRoute = require('./routes/users');
const shareRoute = require('./routes/share');
const remindersRoute = require('./routes/reminders');
const chatRoute = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','), methods: ['GET', 'POST', 'DELETE'] } });
app.set('io', io);

app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '256kb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 300 }));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString(), source: process.env.TICKETMASTER_API_KEY ? 'ticketmaster' : 'mock', db: !!process.env.MONGODB_URI }));

app.use('/api/events', eventsRoute);
app.use('/api/rsvps', rsvpsRoute);
app.use('/api/users', usersRoute);
app.use('/api/share-links', shareRoute);
app.use('/api/reminders', remindersRoute);
app.use('/api/chat', chatRoute);

app.use(errorHandler);

io.on('connection', (socket) => {
  socket.emit('hello', { ok: true });
  socket.on('chat:message', (msg) => socket.broadcast.emit('chat:message', msg));
});

const PORT = process.env.PORT || 8080;
connectDB(process.env.MONGODB_URI)
  .catch((e) => console.error('[db] connection failed, continuing in mock mode:', e.message))
  .finally(() => server.listen(PORT, () => console.log(`[api] listening on :${PORT}`)));
