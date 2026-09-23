const Plan = require('../models/Plan');

/* =========================================================
   BRANCH HELPERS
   ========================================================= */

const VALID_BRANCHES = ['Kalyanpur', 'Gopalpur'];

/**
 * Check whether the logged-in user is the main admin.
 */
const isMainAdmin = (req) => {
    return req.admin && req.admin.role === 'admin';
};

/**
 * Get the branch assigned to the logged-in user.
 *
 * Main admin:
 *   -> null because main admin can access both branches.
 *
 * Receptionist / branch staff:
 *   -> their assigned branch.
 *
 * Invalid / missing branch:
 *   -> empty string.
 *
 * IMPORTANT:
 * Never default to Kalyanpur.
 */
const getAccessibleBranch = (req) => {
    if (isMainAdmin(req)) {
        return null;
    }

    if (req.admin && req.admin.gymBranch) {
        return String(req.admin.gymBranch).trim();
    }

    return '';
};

/**
 * Validate branch.
 */
const isValidBranch = (branch) => {
    return VALID_BRANCHES.includes(branch);
};

/**
 * Escape user input before using it in a RegExp.
 */
const escapeRegex = (value) => {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate duration.
 *
 * Plans use whole months:
 * 1, 3, 6, 12, etc.
 */
const isValidDuration = (value) => {
    return (
        Number.isInteger(value) &&
        value >= 1
    );
};

/**
 * Validate price.
 */
const isValidPrice = (value) => {
    return (
        Number.isFinite(value) &&
        value >= 0
    );
};

/* =========================================================
   GET ACTIVE PLANS
   GET /api/plans
   ========================================================= */

const getPlans = async(req, res) => {
    try {
        const accessibleBranch = getAccessibleBranch(req);

        // Non-main admin must have a branch.
        if (!isMainAdmin(req) && !accessibleBranch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        const query = {
            isActive: true,
        };

        // Main admin -> both branches.
        if (!isMainAdmin(req)) {
            if (!isValidBranch(accessibleBranch)) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or unsupported gym branch.',
                });
            }

            query.gymBranch = accessibleBranch;
        }

        const plans = await Plan.find(query)
            .sort({
                gymBranch: 1,
                durationMonths: 1,
                price: 1,
            });

        return res.status(200).json({
            success: true,
            count: plans.length,
            plans,
        });
    } catch (error) {
        console.error('Get plans error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch membership plans.',
            error: error.message,
        });
    }
};

/* =========================================================
   GET ALL PLANS
   GET /api/plans/all

   Includes inactive plans.
   ========================================================= */

const getAllPlans = async(req, res) => {
    try {
        const accessibleBranch = getAccessibleBranch(req);

        if (!isMainAdmin(req) && !accessibleBranch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        const query = {};

        // Main admin -> both branches.
        // Receptionist -> assigned branch only.
        if (!isMainAdmin(req)) {
            if (!isValidBranch(accessibleBranch)) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or unsupported gym branch.',
                });
            }

            query.gymBranch = accessibleBranch;
        }

        const plans = await Plan.find(query)
            .sort({
                gymBranch: 1,
                isActive: -1,
                durationMonths: 1,
                price: 1,
            });

        return res.status(200).json({
            success: true,
            count: plans.length,
            plans,
        });
    } catch (error) {
        console.error('Get all plans error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch membership plans.',
            error: error.message,
        });
    }
};

/* =========================================================
   GET PLAN BY ID
   GET /api/plans/:id
   ========================================================= */

const getPlanById = async(req, res) => {
    try {
        const { id } = req.params;
        const accessibleBranch = getAccessibleBranch(req);

        if (!isMainAdmin(req) && !accessibleBranch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        const query = {
            _id: id,
        };

        // Receptionist can only access their branch.
        if (!isMainAdmin(req)) {
            if (!isValidBranch(accessibleBranch)) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or unsupported gym branch.',
                });
            }

            query.gymBranch = accessibleBranch;
        }

        const plan = await Plan.findOne(query);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Membership plan not found.',
            });
        }

        return res.status(200).json({
            success: true,
            plan,
        });
    } catch (error) {
        console.error('Get plan by ID error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch membership plan.',
            error: error.message,
        });
    }
};

/* =========================================================
   CREATE PLAN
   POST /api/plans
   ========================================================= */

const createPlan = async(req, res) => {
    try {
        const {
            name,
            durationMonths,
            price,
            description,
            gymBranch,
            isActive,
        } = req.body;

        const mainAdmin = isMainAdmin(req);
        const accessibleBranch = getAccessibleBranch(req);

        /* --------------------------------------------------
           BASIC VALIDATION
        -------------------------------------------------- */

        if (!name || !String(name).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Plan name is required.',
            });
        }

        if (
            durationMonths === undefined ||
            durationMonths === null ||
            durationMonths === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Duration in months is required.',
            });
        }

        if (
            price === undefined ||
            price === null ||
            price === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Plan price is required.',
            });
        }

        /* --------------------------------------------------
           DETERMINE BRANCH
        -------------------------------------------------- */

        let selectedBranch;

        if (mainAdmin) {
            // Main admin MUST explicitly choose a branch.
            selectedBranch =
                gymBranch !== undefined &&
                gymBranch !== null ?
                String(gymBranch).trim() :
                '';
        } else {
            // Receptionist MUST use assigned branch.
            selectedBranch = accessibleBranch;
        }

        if (!selectedBranch) {
            return res.status(400).json({
                success: false,
                message: 'Gym branch is required. Please select Kalyanpur or Gopalpur.',
            });
        }

        if (!isValidBranch(selectedBranch)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch. Allowed branches are Kalyanpur and Gopalpur.',
            });
        }

        // Extra protection for non-main accounts.
        if (!mainAdmin &&
            !isValidBranch(accessibleBranch)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        /* --------------------------------------------------
           NORMALIZE VALUES
        -------------------------------------------------- */

        const normalizedName = String(name).trim();

        const parsedDuration = Number(durationMonths);
        const parsedPrice = Number(price);

        if (!isValidDuration(parsedDuration)) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be a whole number greater than or equal to 1.',
            });
        }

        if (!isValidPrice(parsedPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a valid number greater than or equal to 0.',
            });
        }

        /* --------------------------------------------------
           DUPLICATE ACTIVE PLAN CHECK
        -------------------------------------------------- */

        const escapedName = escapeRegex(normalizedName);

        const existingPlan = await Plan.findOne({
            gymBranch: selectedBranch,
            name: {
                $regex: `^${escapedName}$`,
                $options: 'i',
            },
            isActive: true,
        });

        if (existingPlan) {
            return res.status(409).json({
                success: false,
                message: `${normalizedName} plan already exists for ${selectedBranch}.`,
            });
        }

        /* --------------------------------------------------
           CREATE PLAN
        -------------------------------------------------- */

        const plan = await Plan.create({
            gymBranch: selectedBranch,
            name: normalizedName,
            durationMonths: parsedDuration,
            price: parsedPrice,
            description: description !== undefined &&
                description !== null ?
                String(description).trim() :
                '',
            isActive: isActive !== undefined ?
                Boolean(isActive) :
                true,
        });

        return res.status(201).json({
            success: true,
            message: 'Membership plan created successfully.',
            plan,
        });
    } catch (error) {
        console.error('Create plan error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to create membership plan.',
            error: error.message,
        });
    }
};

/* =========================================================
   UPDATE PLAN
   PUT /api/plans/:id
   ========================================================= */

const updatePlan = async(req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            durationMonths,
            price,
            description,
            gymBranch,
            isActive,
        } = req.body;

        const mainAdmin = isMainAdmin(req);
        const accessibleBranch = getAccessibleBranch(req);

        /* --------------------------------------------------
           BRANCH ACCESS VALIDATION
        -------------------------------------------------- */

        if (!mainAdmin && !accessibleBranch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        /* --------------------------------------------------
           FIND PLAN
        -------------------------------------------------- */

        const query = {
            _id: id,
        };

        if (!mainAdmin) {
            if (!isValidBranch(accessibleBranch)) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or unsupported gym branch.',
                });
            }

            query.gymBranch = accessibleBranch;
        }

        const plan = await Plan.findOne(query);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Membership plan not found.',
            });
        }

        /* --------------------------------------------------
           DETERMINE FINAL BRANCH
        -------------------------------------------------- */

        let finalBranch;

        if (mainAdmin) {
            // Main admin may move a plan between branches.
            finalBranch =
                gymBranch !== undefined &&
                gymBranch !== null &&
                String(gymBranch).trim() !== '' ?
                String(gymBranch).trim() :
                plan.gymBranch;
        } else {
            // Receptionist cannot move plans.
            finalBranch = accessibleBranch;
        }

        if (!isValidBranch(finalBranch)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch. Allowed branches are Kalyanpur and Gopalpur.',
            });
        }

        /* --------------------------------------------------
           DETERMINE FINAL VALUES
        -------------------------------------------------- */

        const finalName =
            name !== undefined ?
            String(name).trim() :
            String(plan.name).trim();

        const finalDuration =
            durationMonths !== undefined &&
            durationMonths !== null &&
            durationMonths !== '' ?
            Number(durationMonths) :
            plan.durationMonths;

        const finalPrice =
            price !== undefined &&
            price !== null &&
            price !== '' ?
            Number(price) :
            plan.price;

        const finalDescription =
            description !== undefined &&
            description !== null ?
            String(description).trim() :
            plan.description;

        const finalIsActive =
            isActive !== undefined ?
            Boolean(isActive) :
            plan.isActive;

        /* --------------------------------------------------
           VALIDATE FINAL VALUES
        -------------------------------------------------- */

        if (!finalName) {
            return res.status(400).json({
                success: false,
                message: 'Plan name cannot be empty.',
            });
        }

        if (!isValidDuration(finalDuration)) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be a whole number greater than or equal to 1.',
            });
        }

        if (!isValidPrice(finalPrice)) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a valid number greater than or equal to 0.',
            });
        }

        /* --------------------------------------------------
           DUPLICATE ACTIVE PLAN CHECK
        -------------------------------------------------- */

        if (finalIsActive) {
            const escapedName = escapeRegex(finalName);

            const duplicatePlan = await Plan.findOne({
                _id: {
                    $ne: plan._id,
                },
                gymBranch: finalBranch,
                name: {
                    $regex: `^${escapedName}$`,
                    $options: 'i',
                },
                isActive: true,
            });

            if (duplicatePlan) {
                return res.status(409).json({
                    success: false,
                    message: `${finalName} plan already exists for ${finalBranch}.`,
                });
            }
        }

        /* --------------------------------------------------
           UPDATE PLAN
        -------------------------------------------------- */

        plan.gymBranch = finalBranch;
        plan.name = finalName;
        plan.durationMonths = finalDuration;
        plan.price = finalPrice;
        plan.description = finalDescription;
        plan.isActive = finalIsActive;

        await plan.save();

        return res.status(200).json({
            success: true,
            message: 'Membership plan updated successfully.',
            plan,
        });
    } catch (error) {
        console.error('Update plan error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update membership plan.',
            error: error.message,
        });
    }
};

/* =========================================================
   DELETE PLAN
   DELETE /api/plans/:id

   Soft delete:
   isActive = false
   ========================================================= */

const deletePlan = async(req, res) => {
    try {
        const { id } = req.params;

        const mainAdmin = isMainAdmin(req);
        const accessibleBranch = getAccessibleBranch(req);

        /* --------------------------------------------------
           BRANCH ACCESS VALIDATION
        -------------------------------------------------- */

        if (!mainAdmin && !accessibleBranch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        /* --------------------------------------------------
           FIND PLAN
        -------------------------------------------------- */

        const query = {
            _id: id,
        };

        if (!mainAdmin) {
            if (!isValidBranch(accessibleBranch)) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or unsupported gym branch.',
                });
            }

            query.gymBranch = accessibleBranch;
        }

        const plan = await Plan.findOne(query);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Membership plan not found.',
            });
        }

        /* --------------------------------------------------
           SOFT DELETE
        -------------------------------------------------- */

        plan.isActive = false;

        await plan.save();

        return res.status(200).json({
            success: true,
            message: 'Membership plan deactivated successfully.',
            plan,
        });
    } catch (error) {
        console.error('Delete plan error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to deactivate membership plan.',
            error: error.message,
        });
    }
};

/* =========================================================
   EXPORT CONTROLLERS
   ========================================================= */

module.exports = {
    getPlans,
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
};