const express = require('express');
const { customAlphabet } = require('nanoid');
const ShareLink = require('../models/ShareLink');
const { recordClick, friendsAttending, memory } = require('../services/vibeService');

const router = express.Router();
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789', 8);
const memLinks = new Map(); // code -> { code, eventId, userId, rsvpId, clickCount }

// POST /api/share-links { userId, eventId, rsvpId? } -> { code, url }
router.post('/', async (req, res, next) => {
  try {
    const { userId, eventId, rsvpId } = req.body || {};
    if (!userId || !eventId) return res.status(400).json({ error: 'userId and eventId required' });
    const code = `ev-${eventId}-${nanoid()}`.slice(0, 48);
    const base = process.env.PUBLIC_BASE_URL || 'http://localhost:5173';
    if (!process.env.MONGODB_URI) {
      memLinks.set(code, { code, userId, eventId, rsvpId: rsvpId || null, clickCount: 0, createdAt: new Date().toISOString() });
      if (!memory.clicks.has(code)) memory.clicks.set(code, 0);
      return res.status(201).json({ code, url: `${base}/invite/${encodeURIComponent(code)}` });
    }
    const doc = await ShareLink.create({ code, userId, eventId, rsvpId });
    res.status(201).json({ code: doc.code, url: `${base}/invite/${encodeURIComponent(doc.code)}` });
  } catch (err) {
    next(err);
  }
});

// GET /api/share-links/:code/track?eventId= — records a click, returns fresh vibe counts
router.get('/:code/track', async (req, res, next) => {
  try {
    const { code } = req.params;
    const eventId = req.query.eventId || (memLinks.get(code)?.eventId ?? null);
    if (!process.env.MONGODB_URI) {
      if (!memLinks.has(code)) return res.status(404).json({ error: 'Unknown invite code' });
      const result = await recordClick({ code, eventId, ip: req.ip, userAgent: req.headers['user-agent'] });
      const vibe = await friendsAttending(eventId);
      req.app.get('io')?.emit('vibe:update', { eventId, ...vibe });
      return res.json({ code, eventId, ...result, vibe });
    }
    const result = await recordClick({ code, eventId, ip: req.ip, userAgent: req.headers['user-agent'] });
    if (!result) return res.status(404).json({ error: 'Unknown invite code' });
    const link = await ShareLink.findOne({ code });
    const vibe = await friendsAttending(link.eventId);
    req.app.get('io')?.emit('vibe:update', { eventId: link.eventId, ...vibe });
    res.json({ code, eventId: link.eventId, ...result, vibe });
  } catch (err) {
    next(err);
  }
});

// GET /api/share-links/event/:eventId/stats
router.get('/event/:eventId/stats', async (req, res, next) => {
  try {
    res.json({ eventId: req.params.eventId, ...(await friendsAttending(req.params.eventId)) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
