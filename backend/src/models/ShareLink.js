const mongoose = require('mongoose');

const ShareLinkSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    rsvpId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rsvp', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: String, required: true, index: true },
    clickCount: { type: Number, default: 0 },
    rsvpCount: { type: Number, default: 0 }, // friends who RSVP'd via this link
  },
  { timestamps: true }
);

module.exports = mongoose.models.ShareLink || mongoose.model('ShareLink', ShareLinkSchema);
