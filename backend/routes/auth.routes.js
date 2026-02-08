const express = require('express');
const { login, getMe, registerAdmin } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register-admin', registerAdmin); // Should be protected in production
router.get('/me', protect, getMe);

module.exports = router;
