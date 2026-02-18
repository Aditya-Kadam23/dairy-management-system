const DailyMilkEntry = require('../models/DailyMilkEntry');
const DailyDelivery = require('../models/DailyDelivery');
const Employee = require('../models/Employee');
const Consumer = require('../models/Consumer');
const ConsumerAssignment = require('../models/ConsumerAssignment');
const mongoose = require('mongoose');

// @desc    Create daily milk entry
// @route   POST /api/daily-milk
// @access  Private/Admin
exports.createDailyMilkEntry = async (req, res, next) => {
    try {
        const { entryDate, totalMilkCollected, employeeAllocations } = req.body;

        // Check if entry already exists for this date
        const existingEntry = await DailyMilkEntry.findOne({ entryDate });
        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: 'Entry already exists for this date'
            });
        }

        // Validate total allocation matches total collected
        const totalAllocated = employeeAllocations.reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);

        if (totalAllocated > totalMilkCollected) {
            return res.status(400).json({
                success: false,
                message: `Total allocated (${totalAllocated}L) cannot exceed total collected (${totalMilkCollected}L)`
            });
        }

        const entry = await DailyMilkEntry.create({
            entryDate,
            totalMilkCollected,
            employeeAllocations
        });

        const populatedEntry = await DailyMilkEntry.findById(entry._id)
            .populate('employeeAllocations.employeeId', 'name mobileNumber');

        res.status(201).json({
            success: true,
            data: populatedEntry
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all daily milk entries
// @route   GET /api/daily-milk
// @access  Private/Admin
exports.getDailyMilkEntries = async (req, res, next) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        const query = {};

        if (startDate || endDate) {
            query.entryDate = {};
            if (startDate) query.entryDate.$gte = new Date(startDate);
            if (endDate) query.entryDate.$lte = new Date(endDate);
        }

        const entries = await DailyMilkEntry.find(query)
            .populate('employeeAllocations.employeeId', 'name mobileNumber')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ entryDate: -1 });

        const count = await DailyMilkEntry.countDocuments(query);

        res.status(200).json({
            success: true,
            data: entries,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get daily milk entry by date
// @route   GET /api/daily-milk/date/:date
// @access  Private/Admin
exports.getDailyMilkEntryByDate = async (req, res, next) => {
    try {
        const entry = await DailyMilkEntry.findOne({ entryDate: req.params.date })
            .populate('employeeAllocations.employeeId', 'name mobileNumber');

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'No entry found for this date'
            });
        }

        res.status(200).json({
            success: true,
            data: entry
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Record daily delivery
// @route   POST /api/daily-milk/delivery (admin) or POST /api/daily-milk/my-delivery (employee)
// @access  Private
exports.recordDelivery = async (req, res, next) => {
    try {
        let { consumerId, employeeId, deliveryDate, quantityDelivered } = req.body;

        // If employee is recording, use their ID
        if (req.user.role === 'employee') {
            employeeId = req.user._id;
        }

        // Verify consumer exists
        const consumer = await Consumer.findById(consumerId);
        if (!consumer) {
            return res.status(404).json({
                success: false,
                message: 'Consumer not found'
            });
        }

        // Verify employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Verify assignment exists
        const assignment = await ConsumerAssignment.findOne({
            employeeId,
            consumerId,
            isActive: true
        });

        if (!assignment) {
            return res.status(400).json({
                success: false,
                message: 'This consumer is not assigned to this employee'
            });
        }

        // Check if delivery already recorded for this consumer on this date
        const existingDelivery = await DailyDelivery.findOne({
            consumerId,
            deliveryDate
        });

        if (existingDelivery) {
            return res.status(400).json({
                success: false,
                message: 'Delivery already recorded for this consumer today'
            });
        }

        // Get daily milk entry for this date
        const dailyEntry = await DailyMilkEntry.findOne({ entryDate: deliveryDate });

        if (dailyEntry) {
            // Find employee allocation
            const empAllocation = dailyEntry.employeeAllocations.find(
                alloc => alloc.employeeId.toString() === employeeId.toString()
            );

            if (empAllocation) {
                // Check if employee has enough remaining quota
                if (empAllocation.remainingQuantity < quantityDelivered) {
                    return res.status(400).json({
                        success: false,
                        message: `Employee has only ${empAllocation.remainingQuantity}L remaining quota`
                    });
                }

                // Update delivered and remaining quantity
                empAllocation.deliveredQuantity += quantityDelivered;
                empAllocation.remainingQuantity -= quantityDelivered;
                await dailyEntry.save();
            }
        }

        // Create delivery record
        const delivery = await DailyDelivery.create({
            consumerId,
            employeeId,
            deliveryDate,
            quantityDelivered
        });

        const populatedDelivery = await DailyDelivery.findById(delivery._id)
            .populate('consumerId', 'fullName mobileNumber area')
            .populate('employeeId', 'name mobileNumber');

        res.status(201).json({
            success: true,
            data: populatedDelivery
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get deliveries
// @route   GET /api/daily-milk/deliveries
// @access  Private
exports.getDeliveries = async (req, res, next) => {
    try {
        const { employeeId, consumerId, startDate, endDate, page = 1, limit = 10 } = req.query;

        const query = {};

        // If employee role, only show their deliveries
        if (req.user.role === 'employee') {
            query.employeeId = req.user._id;
        } else {
            // Admin can filter by employee
            if (employeeId) query.employeeId = employeeId;
        }

        if (consumerId) query.consumerId = consumerId;

        if (startDate || endDate) {
            query.deliveryDate = {};
            if (startDate) query.deliveryDate.$gte = new Date(startDate);
            if (endDate) query.deliveryDate.$lte = new Date(endDate);
        }

        const deliveries = await DailyDelivery.find(query)
            .populate('consumerId', 'fullName mobileNumber area')
            .populate('employeeId', 'name mobileNumber')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ deliveryDate: -1 });

        const count = await DailyDelivery.countDocuments(query);

        res.status(200).json({
            success: true,
            data: deliveries,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get employee daily quota (for employee view)
// @route   GET /api/daily-milk/my-quota/:date
// @access  Private/Employee
exports.getMyDailyQuota = async (req, res, next) => {
    try {
        const { date } = req.params;

        const dailyEntry = await DailyMilkEntry.findOne({ entryDate: date });

        if (!dailyEntry) {
            return res.status(404).json({
                success: false,
                message: 'No milk entry found for this date'
            });
        }

        const empAllocation = dailyEntry.employeeAllocations.find(
            alloc => alloc.employeeId.toString() === req.user._id.toString()
        );

        if (!empAllocation) {
            return res.status(404).json({
                success: false,
                message: 'No allocation found for you on this date'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                date,
                allocatedQuantity: empAllocation.allocatedQuantity,
                deliveredQuantity: empAllocation.deliveredQuantity,
                remainingQuantity: empAllocation.remainingQuantity
            }
        });

    } catch (error) {
        next(error);
    }
};
// @desc    Verify employee daily entry (Admin confirms return)
// @route   PUT /api/daily-milk/verify/:date/:employeeId
// @access  Private/Admin
exports.verifyEmployeeDailyEntry = async (req, res, next) => {
    try {
        const { date, employeeId } = req.params;

        const entry = await DailyMilkEntry.findOne({ entryDate: date });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'No entry found for this date'
            });
        }

        const allocationIndex = entry.employeeAllocations.findIndex(
            alloc => alloc.employeeId.toString() === employeeId
        );

        if (allocationIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Employee not allocated for this date'
            });
        }

        // Update verification status
        entry.employeeAllocations[allocationIndex].isVerified = true;
        entry.employeeAllocations[allocationIndex].verifiedAt = Date.now();

        await entry.save();

        res.status(200).json({
            success: true,
            message: 'Employee day verified successfully',
            data: entry.employeeAllocations[allocationIndex]
        });

    } catch (error) {
        next(error);
    }
};
