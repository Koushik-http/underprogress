const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'workshop', 'seminar'],
    default: 'technical',
  },
  registrationOpen: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;