const mongoose = require('mongoose');

const dailyMilkEntrySchema = new mongoose.Schema({
    entryDate: {
        type: Date,
        required: [true, 'Entry date is required'],
        unique: true // Only one entry per day
    },
    totalMilkCollected: {
        type: Number,
        required: [true, 'Total milk collected is required'],
        min: [0, 'Total milk cannot be negative']
    },
    employeeAllocations: [{
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
        allocatedQuantity: {
            type: Number,
            required: true,
            min: [0, 'Allocated quantity cannot be negative']
        },
        deliveredQuantity: {
            type: Number,
            default: 0,
            min: [0, 'Delivered quantity cannot be negative']
        },
        remainingQuantity: {
            type: Number,
            default: function () {
                return this.allocatedQuantity;
            }
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster date queries
dailyMilkEntrySchema.index({ entryDate: -1 });

// Virtual to check if total allocation matches total collected
dailyMilkEntrySchema.virtual('isFullyAllocated').get(function () {
    const totalAllocated = this.employeeAllocations.reduce((sum, alloc) => sum + alloc.allocatedQuantity, 0);
    return totalAllocated === this.totalMilkCollected;
});

module.exports = mongoose.model('DailyMilkEntry', dailyMilkEntrySchema);
