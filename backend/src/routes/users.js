const express = require('express');
const { z } = require('zod');
const User = require('../models/User');

const router = express.Router();
const memUsers = new Map();

// POST /api/users/ensure — idempotent demo login (no passwords for assessment scope)
router.post('/ensure', async (req, res, next) => {
  try {
    const Body = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      city: z.string().optional().default('Mumbai'),
    });
    const body = Body.parse(req.body);
    if (!process.env.MONGODB_URI) {
      if (!memUsers.has(body.email)) memUsers.set(body.email, { _id: `u-${Date.now()}`, ...body });
      return res.json(memUsers.get(body.email));
    }
    const user = await User.findOneAndUpdate({ email: body.email }, body, { upsert: true, new: true });
    res.json(user);
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) {
      const u = [...memUsers.values()].find((x) => x._id === req.params.id);
      return res.json(u || null);
    }
    res.json(await User.findById(req.params.id));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
