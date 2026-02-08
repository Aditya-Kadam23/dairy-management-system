const express = require('express');
const {
    getConsumerMonthlyBilling,
    getMonthlyBillingReport,
    getOutstandingAmounts
} = require('../controllers/billing.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All billing routes are admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/consumer/:id/monthly', getConsumerMonthlyBilling);
router.get('/report', getMonthlyBillingReport);
router.get('/outstanding', getOutstandingAmounts);

module.exports = router;
