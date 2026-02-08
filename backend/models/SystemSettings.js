const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    defaultMilkRate: {
        type: Number,
        required: [true, 'Default milk rate is required'],
        min: [0, 'Rate cannot be negative'],
        default: 60 // Default rate per liter in rupees
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
systemSettingsSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
