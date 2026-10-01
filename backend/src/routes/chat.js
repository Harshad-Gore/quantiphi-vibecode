const express = require('express');
const { chatReply } = require('../services/chatService');

const router = express.Router();

// POST /api/chat { message } -> { text, events, intent }
router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message || !String(message).trim()) return res.status(400).json({ error: 'message required' });
    const reply = await chatReply(String(message).slice(0, 500));
    req.app.get('io')?.emit('chat:message', { from: 'assistant', text: reply.text });
    res.json(reply);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
