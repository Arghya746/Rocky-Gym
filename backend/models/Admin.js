const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['admin', 'receptionist'],
        default: 'receptionist',
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },

    permissions: {
        members: {
            view: {
                type: Boolean,
                default: true,
            },
            add: {
                type: Boolean,
                default: true,
            },
            edit: {
                type: Boolean,
                default: true,
            },
            delete: {
                type: Boolean,
                default: false,
            },
        },

        payments: {
            view: {
                type: Boolean,
                default: true,
            },
            add: {
                type: Boolean,
                default: true,
            },
            edit: {
                type: Boolean,
                default: true,
            },
            delete: {
                type: Boolean,
                default: false,
            },
        },

        attendance: {
            view: {
                type: Boolean,
                default: true,
            },
            add: {
                type: Boolean,
                default: true,
            },
            edit: {
                type: Boolean,
                default: true,
            },
            delete: {
                type: Boolean,
                default: false,
            },
        },

        workouts: {
            view: {
                type: Boolean,
                default: true,
            },
            add: {
                type: Boolean,
                default: true,
            },
            edit: {
                type: Boolean,
                default: true,
            },
            delete: {
                type: Boolean,
                default: false,
            },
        },

        enquiries: {
            view: {
                type: Boolean,
                default: true,
            },
            delete: {
                type: Boolean,
                default: false,
            },
        },
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Admin', adminSchema);