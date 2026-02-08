const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All settings routes are admin only
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getSettings).put(updateSettings);

module.exports = router;
