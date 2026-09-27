const mongoose = require('mongoose');
const Plan = require('../models/Plan');

/* =========================================================
   BRANCH CONFIG
   ========================================================= */

const VALID_BRANCHES = ['Kalyanpur', 'Gopalpur'];

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

const normalizeRole = (role) => {
    if (!role) return '';

    return String(role)
        .trim()
        .toLowerCase();
};

const isMainAdmin = (req) => {
    const role = normalizeRole(req.admin.role);

    return MAIN_ADMIN_ROLES.includes(role);
};

const isBranchUser = (req) => {
    const role = normalizeRole(req.admin.role);

    return BRANCH_USER_ROLES.includes(role);
};

/* =========================================================
   BRANCH HELPERS
   ========================================================= */

const normalizeBranch = (branch) => {
    if (!branch) return '';

    const normalized = String(branch)
        .trim()
        .toLowerCase();

    if (normalized === 'kalyanpur') {
        return 'Kalyanpur';
    }

    if (normalized === 'gopalpur') {
        return 'Gopalpur';
    }

    return String(branch).trim();
};

const isValidBranch = (branch) => {
    return VALID_BRANCHES.includes(
        normalizeBranch(branch)
    );
};

/**
 * Main admin:
 *   -> null = access to both branches
 *
 * Receptionist / staff:
 *   -> assigned branch
 *
 * Missing branch:
 *   -> ''
 */
const getAccessibleBranch = (req) => {
    if (isMainAdmin(req)) {
        return null;
    }

    if (req.admin.gymBranch) {
        return normalizeBranch(req.admin.gymBranch);
    }

    return '';
};

/* =========================================================
   AUTHORIZATION HELPER
   ========================================================= */

const validatePlanAccess = (req, res) => {
    const role = normalizeRole(req.admin.role);

    if (MAIN_ADMIN_ROLES.includes(role)) {
        return true;
    }

    if (!BRANCH_USER_ROLES.includes(role)) {
        res.status(403).json({
            success: false,
            message: 'You are not authorized to access membership plans.',
        });

        return false;
    }

    const branch = getAccessibleBranch(req);

    if (!branch) {
        res.status(403).json({
            success: false,
            message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
        });

        return false;
    }

    if (!isValidBranch(branch)) {
        res.status(403).json({
            success: false,
            message: 'Invalid or unsupported gym branch.',
        });

        return false;
    }

    return true;
};

/* =========================================================
   VALUE HELPERS
   ========================================================= */

const parseBoolean = (value, defaultValue = undefined) => {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (normalized === 'true') {
            return true;
        }

        if (normalized === 'false') {
            return false;
        }
    }

    return defaultValue;
};

const isValidDuration = (value) => {
    return (
        Number.isInteger(value) &&
        value >= 1
    );
};

const isValidPrice = (value) => {
    return (
        Number.isFinite(value) &&
        value >= 0
    );
};

/**
 * Escape user input before using it in RegExp.
 */
const escapeRegex = (value) => {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );
};

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/* =========================================================
   GET ACTIVE PLANS
   GET /api/plans
   ========================================================= */

const getPlans = async(req, res) => {
    try {
        if (!validatePlanAccess(req, res)) {
            return;
        }

        const accessibleBranch = getAccessibleBranch(req);

        const query = {
            isActive: true,
        };

        if (!isMainAdmin(req)) {
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
   ========================================================= */

const getAllPlans = async(req, res) => {
    try {
        if (!validatePlanAccess(req, res)) {
            return;
        }

        const accessibleBranch = getAccessibleBranch(req);

        const query = {};

        if (!isMainAdmin(req)) {
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
        if (!validatePlanAccess(req, res)) {
            return;
        }

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid membership plan ID.',
            });
        }

        const query = {
            _id: id,
        };

        if (!isMainAdmin(req)) {
            query.gymBranch = getAccessibleBranch(req);
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
        if (!validatePlanAccess(req, res)) {
            return;
        }

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
            selectedBranch =
                gymBranch !== undefined &&
                gymBranch !== null ?
                normalizeBranch(gymBranch) :
                '';
        } else {
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

        const parsedIsActive = parseBoolean(
            isActive,
            true
        );

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
                String(description).trim() : '',
            isActive: parsedIsActive,
        });

        return res.status(201).json({
            success: true,
            message: 'Membership plan created successfully.',
            plan,
        });
    } catch (error) {
        console.error('Create plan error:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An active membership plan with the same name already exists for this branch.',
            });
        }

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
        if (!validatePlanAccess(req, res)) {
            return;
        }

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid membership plan ID.',
            });
        }

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
           FIND PLAN
        -------------------------------------------------- */

        const query = {
            _id: id,
        };

        if (!mainAdmin) {
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
            finalBranch =
                gymBranch !== undefined &&
                gymBranch !== null &&
                String(gymBranch).trim() !== '' ?
                normalizeBranch(gymBranch) :
                normalizeBranch(plan.gymBranch);
        } else {
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
            parseBoolean(isActive, plan.isActive) :
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

        if (typeof finalIsActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be true or false.',
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

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An active membership plan with the same name already exists for this branch.',
            });
        }

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
        if (!validatePlanAccess(req, res)) {
            return;
        }

        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid membership plan ID.',
            });
        }

        const mainAdmin = isMainAdmin(req);
        const accessibleBranch = getAccessibleBranch(req);

        const query = {
            _id: id,
        };

        if (!mainAdmin) {
            query.gymBranch = accessibleBranch;
        }

        const plan = await Plan.findOne(query);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Membership plan not found.',
            });
        }

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