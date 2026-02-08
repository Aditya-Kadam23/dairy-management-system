const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Login user (Admin or Employee)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { username, password, role } = req.body;

        // Validate input
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, password, and role'
            });
        }

        let user;

        // Check role and find user
        if (role === 'admin') {
            user = await Admin.findOne({
                $or: [{ username }, { email: username }]
            }).select('+password');
        } else if (role === 'employee') {
            user = await Employee.findOne({ mobileNumber: username }).select('+password');
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if employee is active
        if (role === 'employee' && !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        // Verify password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id, role);

        // Send response
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name || user.username,
                role,
                mobileNumber: user.mobileNumber,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = {
            id: req.user._id,
            role: req.user.role,
            name: req.user.name || req.user.username,
            mobileNumber: req.user.mobileNumber,
            email: req.user.email
        };

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register admin (Only for initial setup - should be protected in production)
// @route   POST /api/auth/register-admin
// @access  Public (Make this admin-only in production)
exports.registerAdmin = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ username }, { email }]
        });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this username or email already exists'
            });
        }

        // Create admin
        const admin = await Admin.create({
            username,
            email,
            password
        });

        // Generate token
        const token = generateToken(admin._id, 'admin');

        res.status(201).json({
            success: true,
            token,
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: 'admin'
            }
        });

    } catch (error) {
        next(error);
    }
};
