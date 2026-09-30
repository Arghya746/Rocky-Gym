const mongoose = require('mongoose');
const AccessPass = require('../models/AccessPass');

/* =========================================================
   CONSTANTS
   ========================================================= */

const VALID_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const VALID_PASS_TYPES = [
    'Daily',
    'Weekly',
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

/* =========================================================
   ROLE HELPERS
   ========================================================= */

const normalizeRole = (value) => {
    if (!value) {
        return '';
    }

    return String(value)
        .trim()
        .toLowerCase();
};

const isMainAdmin = (req) => {
    if (!req || !req.admin) {
        return false;
    }

    return MAIN_ADMIN_ROLES.includes(
        normalizeRole(req.admin.role)
    );
};

const isBranchUser = (req) => {
    if (!req || !req.admin) {
        return false;
    }

    return BRANCH_USER_ROLES.includes(
        normalizeRole(req.admin.role)
    );
};

/* =========================================================
   BRANCH HELPERS
   ========================================================= */

const normalizeBranch = (value) => {
    if (!value) {
        return '';
    }

    const branch = String(value)
        .trim()
        .toLowerCase();

    if (branch === 'kalyanpur') {
        return 'Kalyanpur';
    }

    if (branch === 'gopalpur') {
        return 'Gopalpur';
    }

    return '';
};

/*
 * Main admin:
 *     all branches
 *
 * Receptionist/staff:
 *     gymBranches is authoritative
 *
 * Legacy:
 *     gymBranch is supported as fallback
 */
const getAccessibleBranches = (req) => {
    if (!req || !req.admin) {
        return [];
    }

    if (isMainAdmin(req)) {
        return [...VALID_BRANCHES];
    }

    let branches = [];

    if (Array.isArray(req.admin.gymBranches)) {
        branches = req.admin.gymBranches
            .map(normalizeBranch)
            .filter(Boolean);
    }

    if (
        branches.length === 0 &&
        req.admin.gymBranch
    ) {
        const legacyBranch = normalizeBranch(
            req.admin.gymBranch
        );

        if (legacyBranch) {
            branches = [legacyBranch];
        }
    }

    return [
        ...new Set(
            branches.filter((branch) =>
                VALID_BRANCHES.includes(branch)
            )
        ),
    ];
};

const getAccessibleBranch = (req) => {
    const branches = getAccessibleBranches(req);

    return branches.length === 1 ?
        branches[0] :
        '';
};

/* =========================================================
   ACCESS VALIDATION
   ========================================================= */

const validateAccess = (req, res) => {
    if (!req || !req.admin) {
        res.status(401).json({
            success: false,
            message: 'Not authorized. Please login again.',
        });

        return false;
    }

    const role = normalizeRole(
        req.admin.role
    );

    if (MAIN_ADMIN_ROLES.includes(role)) {
        return true;
    }

    if (!BRANCH_USER_ROLES.includes(role)) {
        res.status(403).json({
            success: false,
            message: 'You are not authorized to manage access passes.',
        });

        return false;
    }

    const branches = getAccessibleBranches(req);

    if (branches.length === 0) {
        res.status(403).json({
            success: false,
            message: 'Your account is not assigned to a gym branch.',
        });

        return false;
    }

    return true;
};

/* =========================================================
   PASS TYPE NORMALIZATION
   ========================================================= */

const normalizePassType = (value) => {
    if (!value) {
        return '';
    }

    const type = String(value)
        .trim()
        .toLowerCase();

    if (
        type === 'daily' ||
        type === 'daily access'
    ) {
        return 'Daily';
    }

    if (
        type === 'weekly' ||
        type === 'weekly access'
    ) {
        return 'Weekly';
    }

    return '';
};

const getPassName = (type) => {
    if (type === 'Daily') {
        return 'Daily Access';
    }

    if (type === 'Weekly') {
        return 'Weekly Access';
    }

    return '';
};

const getDurationDays = (type) => {
    if (type === 'Daily') {
        return 1;
    }

    if (type === 'Weekly') {
        return 7;
    }

    return null;
};

/* =========================================================
   NUMBER HELPERS
   ========================================================= */

const parseNumber = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number) ||
        number < 0
    ) {
        return null;
    }

    return number;
};

/* =========================================================
   BOOLEAN HELPER
   ========================================================= */

const parseBoolean = (
    value,
    defaultValue
) => {
    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {
        return defaultValue;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value
            .trim()
            .toLowerCase();

        if (normalized === 'true') {
            return true;
        }

        if (normalized === 'false') {
            return false;
        }
    }

    return defaultValue;
};

/* =========================================================
   DESCRIPTION
   ========================================================= */

const normalizeDescription = (value) => {
    if (
        value === undefined ||
        value === null
    ) {
        return '';
    }

    return String(value).trim();
};

/* =========================================================
   RESOLVE REQUESTED BRANCH
   ========================================================= */

const resolveRequestedBranch = (
    req,
    requestedBranch
) => {
    if (isMainAdmin(req)) {
        const branch = normalizeBranch(
            requestedBranch
        );

        if (!branch) {
            return {
                error: 'A valid gym branch is required.',
                status: 400,
            };
        }

        return {
            branch,
        };
    }

    const accessibleBranches =
        getAccessibleBranches(req);

    if (accessibleBranches.length === 0) {
        return {
            error: 'Your account is not assigned to a valid gym branch.',
            status: 403,
        };
    }

    /*
     * Branch user must never be able to write
     * to a branch outside their assignment.
     */
    if (requestedBranch) {
        const requested =
            normalizeBranch(requestedBranch);

        if (!requested) {
            return {
                error: 'Invalid gym branch.',
                status: 400,
            };
        }

        if (!accessibleBranches.includes(
                requested
            )) {
            return {
                error: 'You do not have access to the selected gym branch.',
                status: 403,
            };
        }

        return {
            branch: requested,
        };
    }

    /*
     * If a receptionist has multiple branches,
     * the frontend must explicitly select one.
     */
    if (accessibleBranches.length > 1) {
        return {
            error: 'Please select a gym branch.',
            status: 400,
        };
    }

    return {
        branch: accessibleBranches[0],
    };
};

/* =========================================================
   GET ACTIVE ACCESS PASSES
   GET /api/access-passes
   ========================================================= */

const getAccessPasses = async(
    req,
    res
) => {
    try {
        if (!validateAccess(req, res)) {
            return;
        }

        const query = {
            isActive: true,
        };

        if (!isMainAdmin(req)) {
            const branches =
                getAccessibleBranches(req);

            if (branches.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is not assigned to a gym branch.',
                });
            }

            query.gymBranch = {
                $in: branches,
            };
        }

        const passes =
            await AccessPass.find(query)
            .sort({
                gymBranch: 1,
                durationDays: 1,
            });

        return res.status(200).json({
            success: true,
            count: passes.length,
            passes,
        });

    } catch (error) {
        console.error(
            'Get Access Passes Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch access passes.',
        });
    }
};

/* =========================================================
   GET ALL ACCESS PASSES
   GET /api/access-passes/all
   ========================================================= */

const getAllAccessPasses = async(
    req,
    res
) => {
    try {
        if (!validateAccess(req, res)) {
            return;
        }

        const query = {};

        if (!isMainAdmin(req)) {
            const branches =
                getAccessibleBranches(req);

            if (branches.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is not assigned to a gym branch.',
                });
            }

            query.gymBranch = {
                $in: branches,
            };
        }

        const passes =
            await AccessPass.find(query)
            .sort({
                gymBranch: 1,
                durationDays: 1,
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: passes.length,
            passes,
        });

    } catch (error) {
        console.error(
            'Get All Access Passes Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch all access passes.',
        });
    }
};

/* =========================================================
   PUBLIC ACCESS PASSES
   GET /api/access-passes/public
   ========================================================= */

const getPublicAccessPasses = async(
    req,
    res
) => {
    try {
        const query = {
            isActive: true,
        };

        const requestedBranch =
            normalizeBranch(
                req.query.branch
            );

        if (requestedBranch) {
            query.gymBranch =
                requestedBranch;
        }

        const passes =
            await AccessPass.find(query)
            .sort({
                gymBranch: 1,
                durationDays: 1,
            });

        return res.status(200).json({
            success: true,
            count: passes.length,
            passes,
        });

    } catch (error) {
        console.error(
            'Public Access Pass Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch public access passes.',
        });
    }
};

/* =========================================================
   GET SINGLE PASS
   GET /api/access-passes/:id
   ========================================================= */

const getAccessPassById = async(
    req,
    res
) => {
    try {
        if (!validateAccess(req, res)) {
            return;
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid access pass ID.',
            });
        }

        const query = {
            _id: id,
        };

        if (!isMainAdmin(req)) {
            const branches =
                getAccessibleBranches(req);

            query.gymBranch = {
                $in: branches,
            };
        }

        const pass =
            await AccessPass.findOne(query);

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: 'Access pass not found.',
            });
        }

        return res.status(200).json({
            success: true,
            pass,
        });

    } catch (error) {
        console.error(
            'Get Access Pass Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch access pass.',
        });
    }
};

/* =========================================================
   CREATE ACCESS PASS
   POST /api/access-passes
   ========================================================= */

const createAccessPass = async(
    req,
    res
) => {
    try {
        if (!validateAccess(req, res)) {
            return;
        }

        const {
            gymBranch,
            type,
            passType,
            name,
            price,
            durationDays,
            description,
        } = req.body || {};

        /*
         * Accept:
         * type = Daily / Weekly
         *
         * Also accept old values temporarily:
         * passType = Daily Access / Weekly Access
         *
         * This prevents an old frontend request from
         * breaking while the project is being cleaned.
         */
        const normalizedType =
            normalizePassType(
                type ||
                passType ||
                name
            );

        if (!VALID_PASS_TYPES.includes(
                normalizedType
            )) {
            return res.status(400).json({
                success: false,
                message: 'Pass type must be Daily or Weekly.',
            });
        }

        const branchResult =
            resolveRequestedBranch(
                req,
                gymBranch
            );

        if (branchResult.error) {
            return res
                .status(branchResult.status)
                .json({
                    success: false,
                    message: branchResult.error,
                });
        }

        const selectedBranch =
            branchResult.branch;

        const parsedPrice =
            parseNumber(price);

        if (parsedPrice === null) {
            return res.status(400).json({
                success: false,
                message: 'Valid pass price is required.',
            });
        }

        const expectedDuration =
            getDurationDays(
                normalizedType
            );

        /*
         * Daily = 1 day
         * Weekly = 7 days
         *
         * Do not allow arbitrary duration.
         */
        if (
            durationDays !== undefined &&
            Number(durationDays) !==
            expectedDuration
        ) {
            return res.status(400).json({
                success: false,
                message: `${getPassName(normalizedType)} must have a duration of ${expectedDuration} day(s).`,
            });
        }

        const existingPass =
            await AccessPass.findOne({
                gymBranch: selectedBranch,
                type: normalizedType,
                isActive: true,
            });

        if (existingPass) {
            return res.status(409).json({
                success: false,
                message: `${getPassName(normalizedType)} already exists for ${selectedBranch}.`,
            });
        }

        const pass =
            await AccessPass.create({
                gymBranch: selectedBranch,

                name: getPassName(
                    normalizedType
                ),

                type: normalizedType,

                durationDays: expectedDuration,

                price: parsedPrice,

                description: normalizeDescription(
                    description
                ),

                isActive: true,
            });

        return res.status(201).json({
            success: true,
            message: 'Access pass created successfully.',
            pass,
        });

    } catch (error) {
        console.error(
            'Create Access Pass Error:',
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An active access pass of this type already exists for this branch.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to create access pass.',
        });
    }
};

/* =========================================================
   UPDATE ACCESS PASS
   PUT /api/access-passes/:id
   ========================================================= */

const updateAccessPass = async(
    req,
    res
) => {
    try {
        if (!validateAccess(req, res)) {
            return;
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid access pass ID.',
            });
        }

        const query = {
            _id: id,
        };

        if (!isMainAdmin(req)) {
            const branches =
                getAccessibleBranches(req);

            query.gymBranch = {
                $in: branches,
            };
        }

        const pass =
            await AccessPass.findOne(query);

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: 'Access pass not found.',
            });
        }

        const {
            gymBranch,
            type,
            passType,
            name,
            price,
            durationDays,
            description,
            isActive,
        } = req.body || {};

        /* -----------------------------------------------------
           BRANCH
        ----------------------------------------------------- */

        let finalBranch =
            pass.gymBranch;

        if (
            isMainAdmin(req) &&
            gymBranch !== undefined
        ) {
            const branchResult =
                resolveRequestedBranch(
                    req,
                    gymBranch
                );

            if (branchResult.error) {
                return res
                    .status(branchResult.status)
                    .json({
                        success: false,
                        message: branchResult.error,
                    });
            }

            finalBranch =
                branchResult.branch;
        }

        /* -----------------------------------------------------
           TYPE
        ----------------------------------------------------- */

        let finalType =
            pass.type;

        if (
            type !== undefined ||
            passType !== undefined ||
            name !== undefined
        ) {
            finalType =
                normalizePassType(
                    type ||
                    passType ||
                    name
                );

            if (!VALID_PASS_TYPES.includes(
                    finalType
                )) {
                return res.status(400).json({
                    success: false,
                    message: 'Pass type must be Daily or Weekly.',
                });
            }
        }

        const finalDuration =
            getDurationDays(finalType);

        if (
            durationDays !== undefined &&
            Number(durationDays) !==
            finalDuration
        ) {
            return res.status(400).json({
                success: false,
                message: `${getPassName(finalType)} must have a duration of ${finalDuration} day(s).`,
            });
        }

        /* -----------------------------------------------------
           PRICE
        ----------------------------------------------------- */

        let finalPrice =
            pass.price;

        if (price !== undefined) {
            finalPrice =
                parseNumber(price);

            if (finalPrice === null) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid pass price.',
                });
            }
        }

        /* -----------------------------------------------------
           ACTIVE STATUS
        ----------------------------------------------------- */

        const finalActive =
            parseBoolean(
                isActive,
                pass.isActive
            );

        /* -----------------------------------------------------
           DUPLICATE CHECK
        ----------------------------------------------------- */

        if (finalActive) {
            const duplicate =
                await AccessPass.findOne({
                    _id: {
                        $ne: pass._id,
                    },

                    gymBranch: finalBranch,

                    type: finalType,

                    isActive: true,
                });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: `${getPassName(finalType)} already exists for ${finalBranch}.`,
                });
            }
        }

        /* -----------------------------------------------------
           UPDATE
        ----------------------------------------------------- */

        pass.gymBranch =
            finalBranch;

        pass.name =
            getPassName(finalType);

        pass.type =
            finalType;

        pass.durationDays =
            finalDuration;

        pass.price =
            finalPrice;

        if (
            description !== undefined
        ) {
            pass.description =
                normalizeDescription(
                    description
                );
        }

        pass.isActive =
            finalActive;

        await pass.save();

        return res.status(200).json({
            success: true,
            message: 'Access pass updated successfully.',
            pass,
        });

    } catch (error) {
        console.error(
            'Update Access Pass Error:',
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An active access pass of this type already exists for this branch.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update access pass.',
        });
    }
};

/* =========================================================
   DELETE / DEACTIVATE
   DELETE /api/access-passes/:id
   ========================================================= */

const deleteAccessPass = async(
    req,
    res
) => {
    try {
        if (!validateAccess(req, res)) {
            return;
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid access pass ID.',
            });
        }

        const query = {
            _id: id,
        };

        if (!isMainAdmin(req)) {
            const branches =
                getAccessibleBranches(req);

            query.gymBranch = {
                $in: branches,
            };
        }

        const pass =
            await AccessPass.findOne(query);

        if (!pass) {
            return res.status(404).json({
                success: false,
                message: 'Access pass not found.',
            });
        }

        pass.isActive = false;

        await pass.save();

        return res.status(200).json({
            success: true,
            message: 'Access pass deactivated successfully.',
            pass,
        });

    } catch (error) {
        console.error(
            'Delete Access Pass Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to deactivate access pass.',
        });
    }
};

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
    getAccessPasses,
    getAllAccessPasses,
    getPublicAccessPasses,
    getAccessPassById,
    createAccessPass,
    updateAccessPass,
    deleteAccessPass,
};