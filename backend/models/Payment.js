const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },

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
        enum: ['Cash', 'UPI', 'Card', 'Bank Transfer'],
        required: true,
    },

    paymentDate: {
        type: Date,
        default: Date.now,
    },

    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed'],
        default: 'Paid',
    },

    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);