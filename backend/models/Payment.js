const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({

    // =========================================
    // GYM BRANCH
    // =========================================

    gymBranch: {
        type: String,
        enum: ['Kalyanpur', 'Gopalpur'],
        required: true,
    },

    // =========================================
    // MEMBER
    // =========================================

    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },

    // =========================================
    // PAYMENT INFORMATION
    // =========================================

    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    amount: {
        type: Number,
        required: true,
        min: 0,
    },

    paymentMethod: {
        type: String,
        enum: [
            'Cash',
            'UPI',
            'Card',
            'Bank Transfer',
        ],
        required: true,
    },

    paymentDate: {
        type: Date,
        default: Date.now,
    },

    status: {
        type: String,
        enum: [
            'Paid',
            'Pending',
            'Failed',
        ],
        default: 'Paid',
    },

    notes: {
        type: String,
        trim: true,
    },

}, {
    timestamps: true,
});

// =========================================
// INDEXES
// =========================================

paymentSchema.index({
    gymBranch: 1,
});

paymentSchema.index({
    gymBranch: 1,
    paymentDate: -1,
});

module.exports =
    mongoose.model(
        'Payment',
        paymentSchema
    );