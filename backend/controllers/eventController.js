const Event = require('../models/Event');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ createdAt: -1 }) // Sort by creation date (newest first)
      .populate('createdBy', 'name') // Populate creator's name
      .select('-__v'); // Exclude version field
    
    // Transform events to include isRegistered field for the current user if student
    const transformedEvents = events.map(event => {
      const eventObj = event.toObject();
      
      // If user is logged in and is a student, check if they're registered
      if (req.user && req.user.role === 'student') {
        eventObj.isRegistered = event.registeredUsers.some(
          userId => userId.toString() === req.user.id
        );
      }
      
      return eventObj;
    });
    
    res.status(200).json(transformedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('registeredUsers', 'name rno');
      
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    
    // Handle invalid ObjectId errors
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    // Check if user role is admin or faculty
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create events' });
    }
    
    const {
      title,
      description,
      date,
      time,
      venue,
      organizer,
      type,
      registrationOpen
    } = req.body;
    
    // Create new event
    const newEvent = new Event({
      title,
      description,
      date,
      time,
      venue,
      organizer,
      type,
      registrationOpen: registrationOpen === undefined ? true : registrationOpen,
      createdBy: req.user.id,
      registeredUsers: []
    });
    
    // Save to database
    const savedEvent = await newEvent.save();
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    // Check if user role is admin or faculty
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update events' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the creator of the event or an admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    // Update fields
    const {
      title,
      description,
      date,
      time,
      venue,
      organizer,
      type,
      registrationOpen
    } = req.body;
    
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (time) event.time = time;
    if (venue) event.venue = venue;
    if (organizer) event.organizer = organizer;
    if (type) event.type = type;
    if (registrationOpen !== undefined) event.registrationOpen = registrationOpen;
    
    // Save updates
    const updatedEvent = await event.save();
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    
    // Handle invalid ObjectId errors
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    // Check if user role is admin or faculty
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete events' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the creator of the event or an admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await event.deleteOne();
    
    res.status(200).json({ message: 'Event removed' });
  } catch (error) {
    console.error('Error deleting event:', error);
    
    // Handle invalid ObjectId errors
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Register user for event
const registerForEvent = async (req, res) => {
  try {
    // Only students can register for events
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can register for events' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if registration is open
    if (!event.registrationOpen) {
      return res.status(400).json({ message: 'Registration is closed for this event' });
    }
    
    // Check if already registered
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    
    // Add user to registered users
    event.registeredUsers.push(req.user.id);
    await event.save();
    
    res.status(200).json({ message: 'Successfully registered for the event' });
  } catch (error) {
    console.error('Error registering for event:', error);
    
    // Handle invalid ObjectId errors
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel event registration
const cancelRegistration = async (req, res) => {
  try {
    // Only students can cancel registrations
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is registered
    if (!event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }
    
    // Remove user from registered users
    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user.id
    );
    
    await event.save();
    
    res.status(200).json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    
    // Handle invalid ObjectId errors
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration
};