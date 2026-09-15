const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },

    offerPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    startDate: {
        type: Date,
        required: true,
    },

    endDate: {
        type: Date,
        required: true,
    },

    description: {
        type: String,
        trim: true,
        default: '',
    },

    benefits: {
        type: [String],
        default: [],
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Offer', offerSchema);