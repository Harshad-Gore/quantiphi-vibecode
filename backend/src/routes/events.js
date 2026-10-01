const express = require('express');
const { fetchEvents } = require('../services/ticketmaster');
const { friendsAttending } = require('../services/vibeService');

const router = express.Router();

// GET /api/events?keyword=&city=&startDate=&endDate=&page=&size=
router.get('/', async (req, res, next) => {
  try {
    const { keyword = '', city = '', startDate, endDate, page = 0, size = 24 } = req.query;
    const data = await fetchEvents({ keyword, city, startDate, endDate, page: Number(page), size: Number(size) });
    // Enrich with server-computed vibe counts (kept cheap: RSVP counts only when DB present)
    const events = await Promise.all(
      data.events.map(async (e) => ({ ...e, vibe: await friendsAttending(e.id) }))
    );
    // Calendar payload: date -> count, computed server-side
    const calendar = {};
    for (const e of data.events) {
      const day = new Date(e.startsAt).toISOString().slice(0, 10);
      calendar[day] = (calendar[day] || 0) + 1;
    }
    res.json({ ...data, events, calendar });
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id/vibe -> realtime Friends Attending count
router.get('/:id/vibe', async (req, res, next) => {
  try {
    res.json({ eventId: req.params.id, ...(await friendsAttending(req.params.id)) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
