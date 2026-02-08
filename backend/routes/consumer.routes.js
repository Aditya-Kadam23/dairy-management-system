const express = require('express');
const {
    getConsumers,
    getConsumer,
    createConsumer,
    updateConsumer,
    deleteConsumer,
    getAreas
} = require('../controllers/consumer.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

router.route('/areas/list').get(getAreas);
router.route('/').get(getConsumers).post(createConsumer);
router.route('/:id').get(getConsumer).put(updateConsumer).delete(deleteConsumer);

module.exports = router;
