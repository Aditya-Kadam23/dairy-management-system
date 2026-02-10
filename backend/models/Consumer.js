const mongoose = require('mongoose');

const consumerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required'],
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    area: {
        type: String,
        required: [true, 'Area is required'],
        trim: true,
        maxlength: [100, 'Area cannot exceed 100 characters']
    },
    perLiterRate: {
        type: Number,
        required: [true, 'Per liter rate is required'],
        min: [0, 'Rate cannot be negative']
    },
    dailyMilkQuota: {
        type: Number,
        default: 0,
        min: [0, 'Quota cannot be negative']
    },
    assignedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
consumerSchema.index({ mobileNumber: 1 });
consumerSchema.index({ area: 1 });
consumerSchema.index({ isActive: 1 });

module.exports = mongoose.model('Consumer', consumerSchema);
