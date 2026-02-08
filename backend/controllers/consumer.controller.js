const Consumer = require('../models/Consumer');
const SystemSettings = require('../models/SystemSettings');

// @desc    Get all consumers
// @route   GET /api/consumers
// @access  Private/Admin
exports.getConsumers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, area, isActive } = req.query;

        const query = {};

        // Search filter
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { mobileNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Area filter
        if (area) {
            query.area = area;
        }

        // Active status filter
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const consumers = await Consumer.find(query)
            .populate('assignedEmployee', 'name mobileNumber')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Consumer.countDocuments(query);

        res.status(200).json({
            success: true,
            data: consumers,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single consumer
// @route   GET /api/consumers/:id
// @access  Private/Admin
exports.getConsumer = async (req, res, next) => {
    try {
        const consumer = await Consumer.findById(req.params.id);

        if (!consumer) {
            return res.status(404).json({
                success: false,
                message: 'Consumer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: consumer
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Create new consumer
// @route   POST /api/consumers
// @access  Private/Admin
exports.createConsumer = async (req, res, next) => {
    try {
        const { fullName, mobileNumber, address, area, perLiterRate } = req.body;

        let rate = perLiterRate;

        // If no rate provided, use default
        if (!rate) {
            const settings = await SystemSettings.findOne();
            rate = settings ? settings.defaultMilkRate : 60;
        }

        const consumer = await Consumer.create({
            fullName,
            mobileNumber,
            address,
            area,
            perLiterRate: rate
        });

        res.status(201).json({
            success: true,
            data: consumer
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update consumer
// @route   PUT /api/consumers/:id
// @access  Private/Admin
exports.updateConsumer = async (req, res, next) => {
    try {
        const consumer = await Consumer.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!consumer) {
            return res.status(404).json({
                success: false,
                message: 'Consumer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: consumer
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete consumer
// @route   DELETE /api/consumers/:id
// @access  Private/Admin
exports.deleteConsumer = async (req, res, next) => {
    try {
        const consumer = await Consumer.findByIdAndDelete(req.params.id);

        if (!consumer) {
            return res.status(404).json({
                success: false,
                message: 'Consumer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Consumer deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all unique areas
// @route   GET /api/consumers/areas/list
// @access  Private/Admin
exports.getAreas = async (req, res, next) => {
    try {
        const areas = await Consumer.distinct('area');

        res.status(200).json({
            success: true,
            data: areas
        });

    } catch (error) {
        next(error);
    }
};
