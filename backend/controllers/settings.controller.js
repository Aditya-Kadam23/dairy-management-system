const SystemSettings = require('../models/SystemSettings');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await SystemSettings.findOne();

        // Create default settings if none exist
        if (!settings) {
            settings = await SystemSettings.create({
                defaultMilkRate: 60
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
    try {
        const { defaultMilkRate } = req.body;

        let settings = await SystemSettings.findOne();

        if (settings) {
            settings.defaultMilkRate = defaultMilkRate;
            await settings.save();
        } else {
            settings = await SystemSettings.create({ defaultMilkRate });
        }

        res.status(200).json({
            success: true,
            data: settings
        });

    } catch (error) {
        next(error);
    }
};
