const crypto = require('crypto');
const ShareLink = require('../models/ShareLink');
const ClickEvent = require('../models/ClickEvent');
const Rsvp = require('../models/Rsvp');

const memory = { clicks: new Map(), // code -> count
  rsvps: new Map() }; // eventId -> count

function hashIp(ip) {
  return crypto.createHash('sha256').update(String(ip || 'unknown')).digest('hex').slice(0, 16);
}

async function recordClick({ code, eventId, ip, userAgent }) {
  const db = !!process.env.MONGODB_URI;
  if (!db) {
    memory.clicks.set(code, (memory.clicks.get(code) || 0) + 1);
    return { clickCount: memory.clicks.get(code) };
  }
  const link = await ShareLink.findOneAndUpdate(
    { code },
    { $inc: { clickCount: 1 } },
    { new: true }
  );
  if (!link) return null;
  await ClickEvent.create({ code, eventId: eventId || link.eventId, ipHash: hashIp(ip), userAgent: String(userAgent || '').slice(0, 300) });
  return { clickCount: link.clickCount };
}

// "Friends Attending" = RSVPs for the event + viral clicks on its share links.
// Computed server-side so the frontend only renders.
async function friendsAttending(eventId) {
  const db = !!process.env.MONGODB_URI;
  if (!db) {
    const clicks = [...memory.clicks.entries()]
      .filter(([code]) => code.startsWith(`ev-${eventId}-`) || code === eventId)
      .reduce((n, [, c]) => n + c, 0);
    return {
      rsvpCount: memory.rsvps.get(eventId) || 0,
      clickCount: clicks,
      friendsAttending: (memory.rsvps.get(eventId) || 0) + clicks,
    };
  }
  const [rsvpCount, links] = await Promise.all([
    Rsvp.countDocuments({ eventId }),
    ShareLink.find({ eventId }),
  ]);
  const clickCount = links.reduce((n, l) => n + (l.clickCount || 0), 0);
  const referralRsvps = links.reduce((n, l) => n + (l.rsvpCount || 0), 0);
  return { rsvpCount, clickCount, referralRsvps, friendsAttending: rsvpCount + clickCount };
}

module.exports = { recordClick, friendsAttending, memory };
