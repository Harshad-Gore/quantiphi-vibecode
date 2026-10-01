const mongoose = require('mongoose');

const ClickEventSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    ipHash: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.models.ClickEvent || mongoose.model('ClickEvent', ClickEventSchema);
