const express = require('express');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllEvents); // Anyone can view events (even without login)
router.get('/:id', getEventById); // Anyone can view event details

// Protected routes (require authentication)
router.post('/', authMiddleware, createEvent); // Create new event
router.put('/:id', authMiddleware, updateEvent); // Update event
router.delete('/:id', authMiddleware, deleteEvent); // Delete event
router.post('/:id/register', authMiddleware, registerForEvent); // Register for event
router.post('/:id/cancel', authMiddleware, cancelRegistration); // Cancel registration

module.exports = router;