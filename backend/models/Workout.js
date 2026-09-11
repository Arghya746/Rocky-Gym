const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },

    workoutName: {
        type: String,
        required: true,
        trim: true,
    },

    workoutType: {
        type: String,
        enum: [
            'Strength',
            'Cardio',
            'Weight Loss',
            'Muscle Building',
            'Flexibility',
            'General Fitness',
        ],
        required: true,
    },

    exercises: [{
        name: {
            type: String,
            required: true,
            trim: true,
        },

        sets: {
            type: Number,
        },

        reps: {
            type: Number,
        },

        duration: {
            type: Number,
        },

        notes: {
            type: String,
            trim: true,
        },
    }, ],

    startDate: {
        type: Date,
        default: Date.now,
    },

    endDate: {
        type: Date,
    },

    status: {
        type: String,
        enum: ['Active', 'Completed'],
        default: 'Active',
    },

    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Workout', workoutSchema);