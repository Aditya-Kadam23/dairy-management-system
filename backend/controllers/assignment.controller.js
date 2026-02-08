const ConsumerAssignment = require('../models/ConsumerAssignment');
const Consumer = require('../models/Consumer');
const Employee = require('../models/Employee');

// @desc    Create assignment (assign consumer to employee)
// @route   POST /api/assignments
// @access  Private/Admin
exports.createAssignment = async (req, res, next) => {
    try {
        const { employeeId, consumerId, dailyMilkQuota } = req.body;

        // Verify employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Verify consumer exists
        const consumer = await Consumer.findById(consumerId);
        if (!consumer) {
            return res.status(404).json({
                success: false,
                message: 'Consumer not found'
            });
        }

        // Check if assignment already exists
        const existingAssignment = await ConsumerAssignment.findOne({
            employeeId,
            consumerId,
            isActive: true
        });

        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message: 'This consumer is already assigned to this employee'
            });
        }

        const assignment = await ConsumerAssignment.create({
            employeeId,
            consumerId,
            dailyMilkQuota: dailyMilkQuota || 0
        });

        // Update consumer's assignedEmployee field
        await Consumer.findByIdAndUpdate(consumerId, {
            assignedEmployee: employeeId
        });

        // Populate for response
        const populatedAssignment = await ConsumerAssignment.findById(assignment._id)
            .populate('employeeId', 'name mobileNumber')
            .populate('consumerId', 'fullName mobileNumber area');

        res.status(201).json({
            success: true,
            data: populatedAssignment
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all assignments or filter by employee
// @route   GET /api/assignments
// @access  Private/Admin
exports.getAssignments = async (req, res, next) => {
    try {
        const { employeeId, consumerId, isActive } = req.query;

        const query = {};

        if (employeeId) query.employeeId = employeeId;
        if (consumerId) query.consumerId = consumerId;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const assignments = await ConsumerAssignment.find(query)
            .populate('employeeId', 'name mobileNumber assignedArea')
            .populate('consumerId', 'fullName mobileNumber area address perLiterRate')
            .sort({ assignedDate: -1 });

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get assignments for a specific employee (Employee view)
// @route   GET /api/assignments/my-assignments
// @access  Private/Employee
exports.getMyAssignments = async (req, res, next) => {
    try {
        const assignments = await ConsumerAssignment.find({
            employeeId: req.user._id,
            isActive: true
        })
            .populate('consumerId', 'fullName mobileNumber area address')
            .sort({ assignedDate: -1 });

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Admin
exports.updateAssignment = async (req, res, next) => {
    try {
        const assignment = await ConsumerAssignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
            .populate('employeeId', 'name mobileNumber')
            .populate('consumerId', 'fullName mobileNumber area');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Update consumer's assignedEmployee field if employee changed
        if (req.body.employeeId) {
            await Consumer.findByIdAndUpdate(assignment.consumerId._id, {
                assignedEmployee: req.body.employeeId
            });
        }

        res.status(200).json({
            success: true,
            data: assignment
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Admin
exports.deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await ConsumerAssignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Clear consumer's assignedEmployee field
        await Consumer.findByIdAndUpdate(assignment.consumerId, {
            assignedEmployee: null
        });

        await assignment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Assignment deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};
