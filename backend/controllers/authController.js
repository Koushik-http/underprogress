const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');

// Constants
const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
};

// Student Login

const loginUser = async (req, res) => {
  const { username, password } = req.body; // username is actually rno

  try {
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Find user by rno (username)
    const user = await Student.findOne({ rno: username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the password matches bdate
    const isMatch = password === user.bdate;
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: ROLES.STUDENT }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.status(200).json({ token, role: ROLES.STUDENT, username: user.rno, name: user.name });
  } catch (error) {
    console.error('Error during student login:', error); // Log the error
    res.status(500).json({ message: 'Server error' });
  }
};

// Faculty Login
// Faculty Login
const loginFaculty = async (req, res) => {
  console.log("calling the faculty function")
  const { username, password } = req.body; // username can be facultyId or email

  try {
    console.log('Searching for faculty with username:', username);

    console.log("faculty",await Faculty.find({}))
    
    const faculty = await Faculty.findOne({
      // $or: [{ facultyId: username }, { email: username }],
       facultyId: username 
    });



    if (!faculty) {
      console.log('Faculty not found in database');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Faculty found:', faculty);

    const isMatch = await faculty.matchPassword(password);
    console.log('Password Match Result:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: faculty._id, role: ROLES.FACULTY }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, role: ROLES.FACULTY, username: faculty.facultyId, name: faculty.name });
  } catch (error) {
    console.error('Error during faculty login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export both functions
module.exports = { loginUser, loginFaculty };