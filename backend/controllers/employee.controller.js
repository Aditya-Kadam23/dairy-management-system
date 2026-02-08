const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
exports.getEmployees = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, isActive } = req.query;

        const query = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { mobileNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Active status filter
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const employees = await Employee.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Employee.countDocuments(query);

        res.status(200).json({
            success: true,
            data: employees,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private/Admin
exports.getEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id).select('-password');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
exports.createEmployee = async (req, res, next) => {
    try {
        const { name, mobileNumber, assignedArea, password } = req.body;

        // Default password is mobile number if not provided
        const employeePassword = password || mobileNumber;

        const employee = await Employee.create({
            name,
            mobileNumber,
            assignedArea,
            password: employeePassword
        });

        // Remove password from response
        employee.password = undefined;

        res.status(201).json({
            success: true,
            data: employee
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
exports.updateEmployee = async (req, res, next) => {
    try {
        // Don't allow password update through this route
        if (req.body.password) {
            delete req.body.password;
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
exports.deleteEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Reset employee password
// @route   PUT /api/employees/:id/reset-password
// @access  Private/Admin
exports.resetPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide new password'
            });
        }

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        employee.password = newPassword;
        await employee.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        next(error);
    }
};
