const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectDate: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdByEmail: { type: String, required: true },
  ctc: { type: Number, required: true },
  margins: { type: [Number], required: true, default: [50, 35, 25] },
  approvedValue: { type: Number, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true }); // Automatically handles createdAt and updatedAt

// Format output to change _id to id to match the React frontend
entrySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => { delete ret._id; }
});

module.exports = mongoose.model('Entry', entrySchema);