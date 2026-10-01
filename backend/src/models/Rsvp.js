const mongoose = require('mongoose');

// Stores a denormalised snapshot of the Ticketmaster event so RSVPs survive
// even when the upstream feed changes. ALL validation/computation server-side.
const RsvpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: String, required: true, index: true },
    eventTitle: { type: String, required: true },
    venue: { type: String, default: '' },
    city: { type: String, default: '' },
    startsAt: { type: Date, required: true },
    imageUrl: { type: String, default: '' },
    genre: { type: String, default: '' },
    status: { type: String, enum: ['interested', 'confirmed'], default: 'confirmed' },
  },
  { timestamps: true }
);

RsvpSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.models.Rsvp || mongoose.model('Rsvp', RsvpSchema);
