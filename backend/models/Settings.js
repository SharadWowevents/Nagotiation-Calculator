const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  accessCode: { type: String, default: 'WOWTEAM2026' },
  approvedEmails: { type: [String], default: ['sachin@wowevents.in'] },
  admins: { type: [String], default: ['sachin@wowevents.in'] }
});

// Format output to remove _id and __v
settingsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => { delete ret._id; }
});

module.exports = mongoose.model('Settings', settingsSchema);