const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: String, required: true },
    remindAt: { type: Date, required: true },
    channel: { type: String, enum: ['inapp', 'email'], default: 'inapp' },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);
