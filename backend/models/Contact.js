const mongoose = require('mongoose');

/* =========================================================
   CONTACT / ENQUIRY SCHEMA
   ========================================================= */

const contactSchema = new mongoose.Schema({
    /* -------------------------------------------------
       NAME
    ------------------------------------------------- */

    name: {
        type: String,
        required: true,
        trim: true,
    },

    /* -------------------------------------------------
       PHONE
    ------------------------------------------------- */

    phone: {
        type: String,
        required: true,
        trim: true,
    },

    /* -------------------------------------------------
       GYM BRANCH
    ------------------------------------------------- */

    gymBranch: {
        type: String,
        enum: [
            'Kalyanpur',
            'Gopalpur',
        ],
        required: true,
        trim: true,
    },

    /* -------------------------------------------------
       FITNESS GOAL
    ------------------------------------------------- */

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

    /* -------------------------------------------------
       MESSAGE
    ------------------------------------------------- */

    message: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

/* =========================================================
   DATABASE INDEX
   ========================================================= */

contactSchema.index({
    gymBranch: 1,
    createdAt: -1,
});

/* =========================================================
   EXPORT
   ========================================================= */

module.exports =
    mongoose.model(
        'Contact',
        contactSchema
    );