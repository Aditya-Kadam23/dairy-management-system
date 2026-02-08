const express = require('express');
const {
    createDailyMilkEntry,
    getDailyMilkEntries,
    getDailyMilkEntryByDate,
    recordDelivery,
    getDeliveries,
    getMyDailyQuota
} = require('../controllers/dailyMilk.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Employee routes
router.get('/my-quota/:date', protect, authorize('employee'), getMyDailyQuota);
router.post('/my-delivery', protect, authorize('employee'), recordDelivery); // Employee can record their own delivery

// Shared routes (both admin and employee can view deliveries)
router.get('/deliveries', protect, getDeliveries);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getDailyMilkEntries).post(createDailyMilkEntry);
router.route('/date/:date').get(getDailyMilkEntryByDate);
router.post('/delivery', recordDelivery); // Admin can record any delivery

module.exports = router;
