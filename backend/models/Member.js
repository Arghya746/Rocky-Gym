const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    phone: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
    },

    age: {
        type: Number,
    },

    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },

    membershipPlan: {
        type: String,
        enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
        required: true,
    },

    membershipStartDate: {
        type: Date,
        required: true,
    },

    membershipEndDate: {
        type: Date,
        required: true,
    },

    amount: {
        type: Number,
        required: true,
    },

    status: {
        type: String,
        enum: ['Active', 'Expired'],
        default: 'Active',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Member', memberSchema);