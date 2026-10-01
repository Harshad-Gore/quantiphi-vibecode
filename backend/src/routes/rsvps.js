const express = require('express');
const { z } = require('zod');
const { Types } = require('mongoose');
const Rsvp = require('../models/Rsvp');
const { memory } = require('../services/vibeService');

const router = express.Router();
const hasDB = () => !!process.env.MONGODB_URI;
const memRsvps = []; // fallback store when Mongo is absent

// In DB mode ids must be ObjectIds. A plain string means the client holds a
// stale identity (e.g. page loaded while the API was down) — tell it to reload.
function assertUserId(userId, res) {
  if (hasDB() && !Types.ObjectId.isValid(userId)) {
    res.status(400).json({ error: 'Unknown session. Please reload the page and try again.' });
    return false;
  }
  return true;
}

const RsvpBody = z.object({
  userId: z.string().min(1),
  eventId: z.string().min(1),
  eventTitle: z.string().min(1),
  venue: z.string().optional().default(''),
  city: z.string().optional().default(''),
  startsAt: z.string().min(1),
  imageUrl: z.string().optional().default(''),
  genre: z.string().optional().default(''),
});

// POST /api/rsvps — all validation server-side via zod
router.post('/', async (req, res, next) => {
  try {
    const body = RsvpBody.parse(req.body);
    if (!assertUserId(body.userId, res)) return;
    if (!hasDB()) {
      const exists = memRsvps.find((r) => r.userId === body.userId && r.eventId === body.eventId);
      if (exists) return res.json(exists);
      const doc = { _id: `mem-${Date.now()}`, ...body, status: 'confirmed', createdAt: new Date().toISOString() };
      memRsvps.push(doc);
      memory.rsvps.set(body.eventId, (memory.rsvps.get(body.eventId) || 0) + 1);
      req.app.get('io')?.emit('vibe:update', { eventId: body.eventId });
      return res.status(201).json(doc);
    }
    const doc = await Rsvp.findOneAndUpdate(
      { userId: body.userId, eventId: body.eventId },
      { ...body, status: 'confirmed' },
      { upsert: true, new: true }
    );
    req.app.get('io')?.emit('vibe:update', { eventId: body.eventId });
    res.status(201).json(doc);
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

// GET /api/rsvps?userId= — RSVP dashboard feed
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    if (!assertUserId(userId, res)) return;
    if (!hasDB()) return res.json(memRsvps.filter((r) => r.userId === userId).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)));
    const docs = await Rsvp.find({ userId }).sort({ startsAt: 1 });
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/rsvps/:id?userId=
router.delete('/:id', async (req, res, next) => {
  try {
    if (!hasDB()) {
      const i = memRsvps.findIndex((r) => r._id === req.params.id);
      if (i >= 0) {
        const [rm] = memRsvps.splice(i, 1);
        memory.rsvps.set(rm.eventId, Math.max(0, (memory.rsvps.get(rm.eventId) || 1) - 1));
        req.app.get('io')?.emit('vibe:update', { eventId: rm.eventId });
      }
      return res.json({ ok: true });
    }
    const doc = await Rsvp.findByIdAndDelete(req.params.id);
    if (doc) req.app.get('io')?.emit('vibe:update', { eventId: doc.eventId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
