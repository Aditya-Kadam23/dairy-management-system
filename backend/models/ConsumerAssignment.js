const mongoose = require('mongoose');

const consumerAssignmentSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Employee ID is required']
    },
    consumerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consumer',
        required: [true, 'Consumer ID is required']
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Compound index to prevent duplicate assignments
consumerAssignmentSchema.index({ employeeId: 1, consumerId: 1 }, { unique: true });

// Indexes for faster queries
consumerAssignmentSchema.index({ employeeId: 1, isActive: 1 });
consumerAssignmentSchema.index({ consumerId: 1, isActive: 1 });

module.exports = mongoose.model('ConsumerAssignment', consumerAssignmentSchema);
