const mongoose = require('mongoose');

const dailyDeliverySchema = new mongoose.Schema({
    consumerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consumer',
        required: [true, 'Consumer ID is required']
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Employee ID is required']
    },
    deliveryDate: {
        type: Date,
        required: [true, 'Delivery date is required']
    },
    quantityDelivered: {
        type: Number,
        required: [true, 'Quantity delivered is required'],
        min: [0, 'Quantity cannot be negative']
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate deliveries on same day
dailyDeliverySchema.index({ consumerId: 1, deliveryDate: 1 }, { unique: true });

// Indexes for faster queries
dailyDeliverySchema.index({ employeeId: 1, deliveryDate: -1 });
dailyDeliverySchema.index({ consumerId: 1, deliveryDate: -1 });
dailyDeliverySchema.index({ deliveryDate: -1 });

module.exports = mongoose.model('DailyDelivery', dailyDeliverySchema);
