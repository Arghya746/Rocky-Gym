const mongoose = require('mongoose');

const VALID_BRANCHES = ['Kalyanpur', 'Gopalpur'];
const VALID_ROLES = ['admin', 'receptionist'];

const permissionSchema = new mongoose.Schema({
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
}, {
    _id: false,
});

const enquiryPermissionSchema = new mongoose.Schema({
    view: {
        type: Boolean,
        default: true,
    },
    delete: {
        type: Boolean,
        default: false,
    },
}, {
    _id: false,
});

const adminSchema = new mongoose.Schema({
    // =========================================
    // BASIC INFORMATION
    // =========================================

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

    // =========================================
    // ROLE
    // =========================================

    role: {
        type: String,
        enum: VALID_ROLES,
        default: 'receptionist',
        required: true,
        trim: true,
    },

    // =========================================
    // GYM BRANCH
    // =========================================
    //
    // Main admin:
    //   gymBranch = null
    //
    // Receptionist:
    //   gymBranch = Kalyanpur / Gopalpur
    //
    // This prevents the system from silently
    // assigning a user to the wrong branch.
    //

    gymBranch: {
        type: String,
        enum: VALID_BRANCHES,
        default: null,
        trim: true,
    },

    // =========================================
    // ACCOUNT STATUS
    // =========================================

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        required: true,
    },

    // =========================================
    // PERMISSIONS
    // =========================================

    permissions: {
        members: {
            type: permissionSchema,
            default: () => ({}),
        },

        payments: {
            type: permissionSchema,
            default: () => ({}),
        },

        attendance: {
            type: permissionSchema,
            default: () => ({}),
        },

        workouts: {
            type: permissionSchema,
            default: () => ({}),
        },

        enquiries: {
            type: enquiryPermissionSchema,
            default: () => ({}),
        },

        // =====================================
        // PLANS
        // =====================================

        plans: {
            type: permissionSchema,
            default: () => ({}),
        },

        // =====================================
        // OFFERS
        // =====================================

        offers: {
            type: permissionSchema,
            default: () => ({}),
        },
    },

}, {
    timestamps: true,
});


// =========================================
// VALIDATION
// =========================================
//
// Receptionist MUST have a branch.
// Main admin does not need a branch.
//

adminSchema.pre('validate', function(next) {

    if (this.role === 'receptionist' && !this.gymBranch) {
        return next(
            new Error(
                'Receptionist must be assigned to a gym branch.'
            )
        );
    }

    if (this.role === 'admin') {
        this.gymBranch = null;
    }

    next();
});


module.exports = mongoose.model('Admin', adminSchema);