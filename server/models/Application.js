const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  key:            { type: String, unique: true, sparse: true },
  applicantName:  { type: String, required: true },
  applicantPhone: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  applicant:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  status:         { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);