const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    gymBranch: {
        type: String,
        enum: ['Kalyanpur', 'Gopalpur'],
        required: true,
    },

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

    specialization: {
        type: String,
        required: true,
        trim: true,
    },

    experience: {
        type: Number,
        default: 0,
        min: 0,
    },

    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },

    photo: {
        type: String,
        default: '',
    },

    bio: {
        type: String,
        trim: true,
        default: '',
    },

    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
}, {
    timestamps: true,
});

module.exports =
    mongoose.model('Trainer', trainerSchema);