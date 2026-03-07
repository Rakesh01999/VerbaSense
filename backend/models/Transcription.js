const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  transcribedText: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  metadata: {
    size: Number,
    format: String,
    duration: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transcription', transcriptionSchema);
