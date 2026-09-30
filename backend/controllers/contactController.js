const Contact = require('../models/Contact');


// =========================================================
// CONSTANTS
// =========================================================

const ALLOWED_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

const BRANCH_USER_ROLES = [
    'receptionist',
    'staff',
];

const ALLOWED_GOALS = [
    'Muscle Building',
    'Fat Loss',
    'Strength',
    'General Fitness',
];


// =========================================================
// ROLE HELPERS
// =========================================================

const normalizeRole = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase();
};

const getRole = (req) => {
    return normalizeRole(req.admin.role);
};

const isMainAdmin = (req) => {
    return MAIN_ADMIN_ROLES.includes(
        getRole(req)
    );
};

const isBranchUser = (req) => {
    return BRANCH_USER_ROLES.includes(
        getRole(req)
    );
};


// =========================================================
// BRANCH HELPERS
// =========================================================

const normalizeBranch = (value) => {
    if (!value) {
        return null;
    }

    // Support objects such as:
    // { _id: 'Kalyanpur' }
    // { name: 'Kalyanpur' }

    if (typeof value === 'object') {
        value =
            value._id ||
            value.name ||
            value.branchName ||
            value.gymBranch ||
            '';
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


// =========================================================
// GET ADMIN ASSIGNED BRANCHES
// =========================================================

const getAdminBranches = (req) => {
    if (!req.admin) {
        return [];
    }

    const branches = [];

    // New multi-branch field
    if (
        Array.isArray(
            req.admin.gymBranches
        )
    ) {
        req.admin.gymBranches.forEach(
            (branch) => {
                const normalized =
                    normalizeBranch(branch);

                if (
                    normalized &&
                    !branches.includes(
                        normalized
                    )
                ) {
                    branches.push(
                        normalized
                    );
                }
            }
        );
    }

    // Legacy field
    const legacyBranch =
        normalizeBranch(
            req.admin.gymBranch ||
            req.admin.branchName ||
            req.admin.branch
        );

    if (
        legacyBranch &&
        !branches.includes(
            legacyBranch
        )
    ) {
        branches.push(
            legacyBranch
        );
    }

    return branches.filter(
        (branch) =>
        ALLOWED_BRANCHES.includes(
            branch
        )
    );
};


// =========================================================
// GET ACTIVE / REQUESTED BRANCH
// =========================================================

const getAccessibleBranches = (req) => {
    if (isMainAdmin(req)) {
        return [
            ...ALLOWED_BRANCHES,
        ];
    }

    return getAdminBranches(req);
};


// =========================================================
// RESOLVE BRANCH FOR READ OPERATIONS
// =========================================================

const resolveReadBranches = (req) => {
    const accessibleBranches =
        getAccessibleBranches(req);

    if (isMainAdmin(req)) {
        return accessibleBranches;
    }

    return accessibleBranches;
};


// =========================================================
// GET REQUESTED BRANCH
// =========================================================

const getRequestedBranch = (req) => {
    if (!req) {
        return null;
    }

    const headerBranch =
        req.headers &&
        req.headers['x-gym-branch'];

    const queryBranch =
        req.query &&
        (
            req.query.branch ||
            req.query.gymBranch
        );

    const bodyBranch =
        req.body &&
        req.body.gymBranch;

    const adminBranch =
        req.adminBranch;

    const storedAdminBranch =
        req.admin &&
        (
            req.admin.activeBranch ||
            req.admin.selectedBranch ||
            req.admin.gymBranch
        );

    return normalizeBranch(
        headerBranch ||
        queryBranch ||
        bodyBranch ||
        adminBranch ||
        storedAdminBranch
    );
};


// =========================================================
// VALIDATE BRANCH ACCESS
// =========================================================

const validateBranchAccess = (
    req,
    requestedBranch
) => {
    if (isMainAdmin(req)) {
        return {
            valid: true,
            branch: requestedBranch || null,
        };
    }

    const accessibleBranches =
        getAccessibleBranches(req);

    if (
        accessibleBranches.length === 0
    ) {
        return {
            valid: false,
            status: 403,
            message: 'Your account is not assigned to a valid gym branch.',
        };
    }

    if (requestedBranch) {
        if (!accessibleBranches.includes(
                requestedBranch
            )) {
            return {
                valid: false,
                status: 403,
                message: 'You do not have access to the selected gym branch.',
            };
        }

        return {
            valid: true,
            branch: requestedBranch,
        };
    }

    // If only one branch is assigned,
    // automatically use it.

    if (
        accessibleBranches.length === 1
    ) {
        return {
            valid: true,
            branch: accessibleBranches[0],
        };
    }

    // Multiple branches but no selection.
    return {
        valid: true,
        branch: null,
        branches: accessibleBranches,
    };
};


// =========================================================
// NORMALIZE GOAL
// =========================================================

const normalizeGoal = (value) => {
    if (!value) {
        return null;
    }

    const normalized = String(value)
        .trim()
        .toLowerCase();

    if (
        normalized ===
        'muscle building'
    ) {
        return 'Muscle Building';
    }

    if (
        normalized === 'fat loss'
    ) {
        return 'Fat Loss';
    }

    if (
        normalized === 'strength'
    ) {
        return 'Strength';
    }

    if (
        normalized ===
        'general fitness'
    ) {
        return 'General Fitness';
    }

    return null;
};


// =========================================================
// CREATE CONTACT / ENQUIRY
// PUBLIC
// =========================================================

const createContact = async(
    req,
    res
) => {
    try {
        const {
            name,
            phone,
            goal,
            message,
            gymBranch,
        } = req.body;

        // -----------------------------------------
        // NAME
        // -----------------------------------------

        const cleanedName =
            String(name || '').trim();

        if (!cleanedName) {
            return res.status(400).json({
                message: 'Name is required.',
            });
        }

        if (
            cleanedName.length > 100
        ) {
            return res.status(400).json({
                message: 'Name is too long.',
            });
        }

        // -----------------------------------------
        // PHONE
        // -----------------------------------------

        const cleanedPhone =
            String(phone || '').trim();

        if (!cleanedPhone) {
            return res.status(400).json({
                message: 'Phone is required.',
            });
        }

        if (!/^[0-9]{10}$/.test(
                cleanedPhone
            )) {
            return res.status(400).json({
                message: 'Please enter a valid 10-digit phone number.',
            });
        }

        // -----------------------------------------
        // BRANCH
        // -----------------------------------------

        const selectedBranch =
            normalizeBranch(
                gymBranch
            );

        if (!selectedBranch ||
            !ALLOWED_BRANCHES.includes(
                selectedBranch
            )
        ) {
            return res.status(400).json({
                message: 'A valid gym branch is required.',
            });
        }

        // -----------------------------------------
        // GOAL
        // -----------------------------------------

        const selectedGoal =
            normalizeGoal(goal);

        if (!selectedGoal ||
            !ALLOWED_GOALS.includes(
                selectedGoal
            )
        ) {
            return res.status(400).json({
                message: 'A valid fitness goal is required.',
            });
        }

        // -----------------------------------------
        // MESSAGE
        // -----------------------------------------

        const cleanedMessage =
            message ?
            String(message).trim() :
            '';

        // -----------------------------------------
        // CREATE
        // -----------------------------------------

        const contact =
            await Contact.create({
                gymBranch: selectedBranch,

                name: cleanedName,

                phone: cleanedPhone,

                goal: selectedGoal,

                message: cleanedMessage,
            });

        return res.status(201).json({
            message: 'Enquiry submitted successfully.',

            contact,
        });

    } catch (error) {
        console.error(
            'Create Contact Error:',
            error
        );

        if (
            error.name ===
            'ValidationError'
        ) {
            return res.status(400).json({
                message: 'Invalid enquiry data.',

                errors: Object.fromEntries(
                    Object.entries(
                        error.errors
                    ).map(
                        ([
                            field,
                            details,
                        ]) => [
                            field,
                            details.message,
                        ]
                    )
                ),
            });
        }

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =========================================================
// GET ALL CONTACTS
// =========================================================

const getContacts = async(
    req,
    res
) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const requestedBranch =
            getRequestedBranch(req);

        const access =
            validateBranchAccess(
                req,
                requestedBranch
            );

        if (!access.valid) {
            return res.status(
                access.status || 403
            ).json({
                message: access.message,
            });
        }

        const query = {};

        // Main admin selecting a branch
        if (access.branch) {
            query.gymBranch =
                access.branch;
        }

        // Branch user with multiple branches
        if (
            isBranchUser(req) &&
            !access.branch
        ) {
            query.gymBranch = {
                $in: access.branches || [],
            };
        }

        const contacts =
            await Contact.find(query)
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            message: 'Enquiries fetched successfully.',

            contacts,
        });

    } catch (error) {
        console.error(
            'Get Contacts Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =========================================================
// GET SINGLE CONTACT
// =========================================================

const getContactById = async(
    req,
    res
) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const id =
            req.params.id;

        const query = {
            _id: id,
        };

        if (isBranchUser(req)) {
            const branches =
                getAccessibleBranches(
                    req
                );

            if (
                branches.length === 0
            ) {
                return res.status(403).json({
                    message: 'Your account is not assigned to a valid gym branch.',
                });
            }

            query.gymBranch = {
                $in: branches,
            };
        }

        const contact =
            await Contact.findOne(
                query
            );

        if (!contact) {
            return res.status(404).json({
                message: 'Enquiry not found.',
            });
        }

        return res.status(200).json({
            contact,
        });

    } catch (error) {
        console.error(
            'Get Contact Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =========================================================
// DELETE CONTACT
// =========================================================

const deleteContact = async(
    req,
    res
) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const query = {
            _id: req.params.id,
        };

        if (isBranchUser(req)) {
            const branches =
                getAccessibleBranches(
                    req
                );

            if (
                branches.length === 0
            ) {
                return res.status(403).json({
                    message: 'Your account is not assigned to a valid gym branch.',
                });
            }

            query.gymBranch = {
                $in: branches,
            };
        }

        const contact =
            await Contact.findOneAndDelete(
                query
            );

        if (!contact) {
            return res.status(404).json({
                message: 'Enquiry not found.',
            });
        }

        return res.status(200).json({
            message: 'Enquiry deleted successfully.',
        });

    } catch (error) {
        console.error(
            'Delete Contact Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    createContact,
    getContacts,
    getContactById,
    deleteContact,
};