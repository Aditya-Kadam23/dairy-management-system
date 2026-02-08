const express = require('express');
const {
    createAssignment,
    getAssignments,
    getMyAssignments,
    updateAssignment,
    deleteAssignment
} = require('../controllers/assignment.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Employee can view their assignments
router.get('/my-assignments', protect, authorize('employee'), getMyAssignments);

// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getAssignments).post(createAssignment);
router.route('/:id').put(updateAssignment).delete(deleteAssignment);

module.exports = router;
