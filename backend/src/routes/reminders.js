const express = require('express');
const { z } = require('zod');
const Reminder = require('../models/Reminder');

const router = express.Router();
const memReminders = [];

const Body = z.object({
  userId: z.string().min(1),
  eventId: z.string().min(1),
  remindAt: z.string().min(1),
  channel: z.enum(['inapp', 'email']).optional().default('inapp'),
});

// POST /api/reminders
router.post('/', async (req, res, next) => {
  try {
    const body = Body.parse(req.body);
    if (!process.env.MONGODB_URI) {
      const doc = { _id: `rem-${Date.now()}`, ...body, sent: false };
      memReminders.push(doc);
      return res.status(201).json(doc);
    }
    res.status(201).json(await Reminder.create(body));
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

// GET /api/reminders?userId=
router.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (!process.env.MONGODB_URI) return res.json(memReminders.filter((r) => r.userId === userId));
    res.json(await Reminder.find({ userId }).sort({ remindAt: 1 }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
