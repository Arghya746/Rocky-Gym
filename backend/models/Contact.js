const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
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

    goal: {
        type: String,
        required: true,
        enum: [
            'Muscle Building',
            'Fat Loss',
            'Strength',
            'General Fitness',
        ],
    },

    message: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Contact', contactSchema);