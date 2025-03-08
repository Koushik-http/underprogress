const express = require('express');
const { loginUser, loginFaculty } = require('../controllers/authController');

const router = express.Router();

router.post('/login/student', loginUser);
router.post('/login/faculty', loginFaculty);

module.exports = router;
