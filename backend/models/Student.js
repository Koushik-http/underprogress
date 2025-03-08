const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  regno: {
    type: Number,
    required: true,
    unique: true,
  },
  rno: {
    type: String,
    required: true,
    unique: true, // Ensure rno is unique
  },
  name: {
    type: String,
    required: true,
  },
  bdate: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;