const mongoose = require('mongoose');

/* ============================================================
   CONSTANTS
   ============================================================ */

const VALID_GYM_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

const RECEPTIONIST_ROLES = [
    'receptionist',
    'staff',
];


/* ============================================================
   DEFAULT RECEPTIONIST PERMISSIONS
   ============================================================ */

const DEFAULT_RECEPTIONIST_PERMISSIONS = {
    members: {
        view: true,
        add: true,
        edit: true,
        delete: false,
    },

    payments: {
        view: true,
        add: true,
        edit: true,
        delete: false,
    },

    attendance: {
        view: true,
        add: true,
        edit: true,
        delete: false,
    },

    workouts: {
        view: true,
        add: true,
        edit: true,
        delete: false,
    },

    enquiries: {
        view: true,
        delete: false,
    },

    plans: {
        view: true,
        add: false,
        edit: false,
        delete: false,
    },

    offers: {
        view: true,
        add: false,
        edit: false,
        delete: false,
    },
};


/* ============================================================
   ADMIN SCHEMA
   ============================================================ */

const adminSchema = new mongoose.Schema({
        /* --------------------------------------------------------
           BASIC INFORMATION
           -------------------------------------------------------- */

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },


        /* --------------------------------------------------------
           ROLE
           -------------------------------------------------------- */

        role: {
            type: String,

            enum: [
                'admin',
                'main_admin',
                'super_admin',
                'receptionist',
                'staff',
            ],

            default: 'receptionist',
        },


        /* ========================================================
           MULTI-BRANCH ACCESS
           ========================================================

           AUTHORITATIVE FIELD.

           Receptionist:

               gymBranches: [
                   'Kalyanpur',
                   'Gopalpur'
               ]

           Main admin:

               gymBranches: []

           A receptionist may therefore access multiple branches,
           while the dashboard chooses one active branch.
        ======================================================== */

        gymBranches: {
            type: [{
                type: String,
                enum: VALID_GYM_BRANCHES,
                trim: true,
            }, ],

            default: [],

            validate: {
                validator: function(branches) {
                    if (!Array.isArray(branches)) {
                        return false;
                    }

                    return (
                        new Set(branches).size ===
                        branches.length
                    );
                },

                message: 'gymBranches cannot contain duplicate branches.',
            },
        },


        /* ========================================================
           LEGACY SINGLE-BRANCH FIELD
           ========================================================

           Kept temporarily for backward compatibility.

           One branch:

               gymBranches: ['Kalyanpur']
               gymBranch: 'Kalyanpur'

           Multiple branches:

               gymBranches: ['Kalyanpur', 'Gopalpur']
               gymBranch: null
        ======================================================== */

        gymBranch: {
            type: String,

            enum: [
                'Kalyanpur',
                'Gopalpur',
                null,
            ],

            default: null,
        },


        /* --------------------------------------------------------
           ACCOUNT STATUS
           -------------------------------------------------------- */

        status: {
            type: String,

            enum: [
                'active',
                'inactive',
            ],

            default: 'active',
        },


        /* --------------------------------------------------------
           PERMISSIONS
           -------------------------------------------------------- */

        permissions: {
            type: mongoose.Schema.Types.Mixed,

            default: () => ({
                ...DEFAULT_RECEPTIONIST_PERMISSIONS,

                members: {
                    ...DEFAULT_RECEPTIONIST_PERMISSIONS.members,
                },

                payments: {
                    ...DEFAULT_RECEPTIONIST_PERMISSIONS.payments,
                },

                attendance: {
                    ...DEFAULT_RECEPTIONIST_PERMISSIONS.attendance,
                },

                workouts: {
                    ...DEFAULT_RECEPTIONIST_PERMISSIONS.workouts,
                },

                enquiries: {
                    ...DEFAULT_RECEPTIONIST_PERMISSIONS.enquiries,
                },

                plans: {
                    ...DEFAULT_RECEPTIONIST_PERMISSIONS.plans,
                },

                offers: {
                    ...DEFAULT_RECEPTIONIST_PERMISSIONS.offers,
                },
            }),
        },
    },

    {
        timestamps: true,
    }
);


/* ============================================================
   BRANCH NORMALIZATION HELPER
   ============================================================ */

const normalizeBranch = (value) => {
    if (!value) {
        return null;
    }

    const normalized = String(value)
        .trim()
        .toLowerCase();

    if (normalized === 'kalyanpur') {
        return 'Kalyanpur';
    }

    if (normalized === 'gopalpur') {
        return 'Gopalpur';
    }

    return null;
};


/* ============================================================
   BRANCH VALIDATION / NORMALIZATION
   ============================================================

   IMPORTANT:
   Do NOT add next() here.

   Your installed Mongoose version executes this validation
   middleware without a callback.
============================================================ */

adminSchema.pre(
    'validate',
    function() {

        /* ========================================================
           RECEPTIONIST / STAFF
           ======================================================== */

        if (
            RECEPTIONIST_ROLES.includes(
                this.role
            )
        ) {
            let branches = Array.isArray(
                    this.gymBranches
                ) ?
                this.gymBranches
                .filter(Boolean)
                .map(normalizeBranch)
                .filter(Boolean) :
                [];

            /* ----------------------------------------------------
               LEGACY COMPATIBILITY
               ---------------------------------------------------- */

            if (
                branches.length === 0 &&
                this.gymBranch
            ) {
                const legacyBranch =
                    normalizeBranch(
                        this.gymBranch
                    );

                if (legacyBranch) {
                    branches = [
                        legacyBranch,
                    ];
                }
            }

            /* ----------------------------------------------------
               REMOVE DUPLICATES
               ---------------------------------------------------- */

            branches = [
                ...new Set(branches),
            ];

            /* ----------------------------------------------------
               VALIDATE
               ---------------------------------------------------- */

            const invalidBranches =
                branches.filter(
                    (branch) =>
                    !VALID_GYM_BRANCHES.includes(
                        branch
                    )
                );

            if (
                invalidBranches.length > 0
            ) {
                this.invalidate(
                    'gymBranches',
                    `Invalid gym branch assigned: ${invalidBranches.join(', ')}`
                );

                return;
            }

            /* ----------------------------------------------------
               REQUIRE AT LEAST ONE BRANCH
               ---------------------------------------------------- */

            if (
                branches.length === 0
            ) {
                this.invalidate(
                    'gymBranches',
                    'Receptionist must be assigned to at least one gym branch.'
                );

                return;
            }

            /* ----------------------------------------------------
               SAVE AUTHORITATIVE BRANCHES
               ---------------------------------------------------- */

            this.gymBranches =
                branches;

            /* ----------------------------------------------------
               KEEP LEGACY FIELD IN SYNC
               ---------------------------------------------------- */

            this.gymBranch =
                branches.length === 1 ?
                branches[0] :
                null;
        }


        /* ========================================================
           MAIN ADMIN
           ======================================================== */

        if (
            MAIN_ADMIN_ROLES.includes(
                this.role
            )
        ) {
            /*
             * Main admins have access to all branches,
             * so they don't need branch assignments.
             */
            this.gymBranches = [];

            this.gymBranch = null;
        }
    }
);


/* ============================================================
   DATABASE INDEXES
   ============================================================ */

adminSchema.index({
    role: 1,
    gymBranches: 1,
});

adminSchema.index({
    gymBranches: 1,
    status: 1,
});


/* ============================================================
   SAFE OBJECT
   ============================================================ */

adminSchema.methods.toSafeObject =
    function() {
        const object =
            this.toObject();

        delete object.password;

        return object;
    };


/* ============================================================
   EXPORT
   ============================================================ */

module.exports =
    mongoose.model(
        'Admin',
        adminSchema
    );