// src/routes/authentication.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authenticationController');

router.post('/login', authController.login);
router.post('/signup', authController.signup);

module.exports = router;

