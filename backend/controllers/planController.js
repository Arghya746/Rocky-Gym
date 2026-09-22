const Plan = require('../models/Plan');

/* =========================================================
   BRANCH HELPERS
   ========================================================= */

const VALID_BRANCHES = ['Kalyanpur', 'Gopalpur'];

/**
 * Check whether the logged-in admin is the main admin.
 *
 * IMPORTANT:
 * Only include roles that your authentication system actually uses.
 */
const isMainAdmin = (req) => {
    return (
        req.admin &&
        req.admin.role === 'admin'
    );
};

/**
 * Get the branch assigned to the logged-in admin.
 *
 * Main admin:
 *   -> returns null because main admin can access both branches.
 *
 * Branch admin/staff:
 *   -> returns their assigned branch.
 *
 * Branchless non-main account:
 *   -> returns empty string.
 *
 * We intentionally DO NOT default to Kalyanpur.
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
 * Validate branch name.
 */
const isValidBranch = (branch) => {
    return VALID_BRANCHES.includes(branch);
};


/* =========================================================
   GET ACTIVE PLANS
   GET /api/plans
   ========================================================= */

const getPlans = async(req, res) => {
    try {
        const accessibleBranch = getAccessibleBranch(req);

        /*
         * A non-main admin MUST have an assigned branch.
         */
        if (!isMainAdmin(req) && !accessibleBranch) {
            return res.status(403).json({
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        /*
         * Main admin:
         *   -> sees active plans from both branches.
         *
         * Branch admin:
         *   -> sees only active plans from assigned branch.
         */
        const query = {
            isActive: true,
        };

        if (!isMainAdmin(req)) {
            if (!isValidBranch(accessibleBranch)) {
                return res.status(403).json({
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
   Includes inactive plans
   ========================================================= */

const getAllPlans = async(req, res) => {
    try {
        const accessibleBranch = getAccessibleBranch(req);

        /*
         * Branchless non-main accounts cannot access plans.
         */
        if (!isMainAdmin(req) && !accessibleBranch) {
            return res.status(403).json({
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        const query = {};

        /*
         * Main admin:
         *   -> all branches.
         *
         * Branch admin:
         *   -> assigned branch only.
         */
        if (!isMainAdmin(req)) {
            if (!isValidBranch(accessibleBranch)) {
                return res.status(403).json({
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

        /*
         * Branchless non-main account cannot access a plan.
         */
        if (!isMainAdmin(req) && !accessibleBranch) {
            return res.status(403).json({
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        const query = {
            _id: id,
        };

        /*
         * Main admin can access either branch.
         *
         * Branch admin can access only their branch.
         */
        if (!isMainAdmin(req)) {
            if (!isValidBranch(accessibleBranch)) {
                return res.status(403).json({
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

        /* -----------------------------------------------
           BASIC VALIDATION
        ------------------------------------------------ */

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

        /* -----------------------------------------------
           DETERMINE BRANCH
        ------------------------------------------------ */

        let selectedBranch;

        if (mainAdmin) {
            /*
             * Main admin must explicitly choose a branch.
             *
             * We no longer silently assign Kalyanpur.
             */
            selectedBranch = gymBranch ?
                String(gymBranch).trim() :
                '';
        } else {
            /*
             * Non-main admin can ONLY use their assigned branch.
             */
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

        /*
         * Non-main account must have a valid assigned branch.
         */
        if (!mainAdmin && !isValidBranch(accessibleBranch)) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        /* -----------------------------------------------
           NORMALIZE VALUES
        ------------------------------------------------ */

        const normalizedName = String(name).trim();

        const parsedDuration = Number(durationMonths);
        const parsedPrice = Number(price);

        if (!Number.isFinite(parsedDuration) ||
            parsedDuration < 1
        ) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be a valid number greater than or equal to 1.',
            });
        }

        if (!Number.isFinite(parsedPrice) ||
            parsedPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a valid number greater than or equal to 0.',
            });
        }

        /* -----------------------------------------------
           DUPLICATE ACTIVE PLAN CHECK
        ------------------------------------------------ */

        const existingPlan = await Plan.findOne({
            gymBranch: selectedBranch,
            name: {
                $regex: `^${normalizedName.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                )}$`,
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

        /* -----------------------------------------------
           CREATE PLAN
        ------------------------------------------------ */

        const plan = await Plan.create({
            gymBranch: selectedBranch,
            name: normalizedName,
            durationMonths: parsedDuration,
            price: parsedPrice,
            description: description !== undefined && description !== null ?
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

        /*
         * Branchless non-main account cannot update plans.
         */
        if (!mainAdmin && !accessibleBranch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        /* -----------------------------------------------
           FIND PLAN
        ------------------------------------------------ */

        const query = {
            _id: id,
        };

        /*
         * Main admin can update either branch.
         *
         * Branch admin can update only their own branch.
         */
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

        /* -----------------------------------------------
           DETERMINE FINAL BRANCH
        ------------------------------------------------ */

        let finalBranch;

        if (mainAdmin) {
            /*
             * Main admin can change branch.
             *
             * If no branch was supplied, keep existing branch.
             */
            finalBranch =
                gymBranch !== undefined &&
                gymBranch !== null &&
                String(gymBranch).trim() !== '' ?
                String(gymBranch).trim() :
                plan.gymBranch;
        } else {
            /*
             * Branch admin CANNOT move a plan to another branch.
             */
            finalBranch = accessibleBranch;
        }

        if (!isValidBranch(finalBranch)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch. Allowed branches are Kalyanpur and Gopalpur.',
            });
        }

        /* -----------------------------------------------
           DETERMINE FINAL VALUES
        ------------------------------------------------ */

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

        /* -----------------------------------------------
           VALIDATE FINAL VALUES
        ------------------------------------------------ */

        if (!finalName) {
            return res.status(400).json({
                success: false,
                message: 'Plan name cannot be empty.',
            });
        }

        if (!Number.isFinite(finalDuration) ||
            finalDuration < 1
        ) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be a valid number greater than or equal to 1.',
            });
        }

        if (!Number.isFinite(finalPrice) ||
            finalPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a valid number greater than or equal to 0.',
            });
        }

        /* -----------------------------------------------
           DUPLICATE ACTIVE PLAN CHECK
        ------------------------------------------------ */

        /*
         * Only active plans need duplicate protection.
         *
         * This allows an inactive old plan to remain in the
         * database while a new active plan with the same name
         * is created.
         */
        if (finalIsActive) {
            const escapedName = finalName.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            );

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

        /* -----------------------------------------------
           UPDATE PLAN
        ------------------------------------------------ */

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
   ========================================================= */

const deletePlan = async(req, res) => {
    try {
        const { id } = req.params;

        const mainAdmin = isMainAdmin(req);
        const accessibleBranch = getAccessibleBranch(req);

        /*
         * Branchless non-main account cannot delete plans.
         */
        if (!mainAdmin && !accessibleBranch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        /* -----------------------------------------------
           FIND PLAN
        ------------------------------------------------ */

        const query = {
            _id: id,
        };

        /*
         * Main admin:
         *   -> can delete/deactivate from either branch.
         *
         * Branch admin:
         *   -> only their assigned branch.
         */
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

        /* -----------------------------------------------
           SOFT DELETE
        ------------------------------------------------ */

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