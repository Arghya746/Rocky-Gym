const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const Plan = require('../models/Plan');

/* =========================================================
   CONSTANTS
   ========================================================= */

const VALID_BRANCHES = [
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
 * -> null = access to both branches
 *
 * Receptionist/staff:
 * -> assigned branch
 *
 * Missing branch:
 * -> ''
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
   ACCESS VALIDATION
   ========================================================= */

const validateOfferAccess = (req, res) => {
    const role = normalizeRole(req.admin.role);

    if (MAIN_ADMIN_ROLES.includes(role)) {
        return true;
    }

    if (!BRANCH_USER_ROLES.includes(role)) {
        res.status(403).json({
            success: false,
            message: 'You are not authorized to access offers.',
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

const escapeRegex = (value) => {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );
};

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const parseBoolean = (
    value,
    defaultValue = undefined
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
        const normalized =
            value.trim().toLowerCase();

        if (normalized === 'true') {
            return true;
        }

        if (normalized === 'false') {
            return false;
        }
    }

    return defaultValue;
};

const parseDate = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};

const normalizeBenefits = (benefits) => {
    if (!Array.isArray(benefits)) {
        return [];
    }

    return [
        ...new Set(
            benefits
            .map((benefit) =>
                String(benefit).trim()
            )
            .filter(Boolean)
        ),
    ];
};

/* =========================================================
   GET CURRENT ACTIVE OFFERS
   GET /api/offers
   ========================================================= */

const getOffers = async(req, res) => {
    try {
        if (!validateOfferAccess(req, res)) {
            return;
        }

        const branch = getAccessibleBranch(req);
        const today = new Date();

        const query = {
            isActive: true,
            startDate: {
                $lte: today,
            },
            endDate: {
                $gte: today,
            },
        };

        if (!isMainAdmin(req)) {
            query.gymBranch = branch;
        }

        const offers = await Offer.find(query)
            .populate(
                'plan',
                'name durationMonths price gymBranch isActive'
            )
            .sort({
                endDate: 1,
                name: 1,
            });

        return res.status(200).json({
            success: true,
            count: offers.length,
            offers,
        });
    } catch (error) {
        console.error(
            'Get Offers Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch offers.',
        });
    }
};

/* =========================================================
   GET ALL OFFERS
   GET /api/offers/all
   ========================================================= */

const getAllOffers = async(req, res) => {
    try {
        if (!validateOfferAccess(req, res)) {
            return;
        }

        const branch = getAccessibleBranch(req);

        const query = {};

        if (!isMainAdmin(req)) {
            query.gymBranch = branch;
        }

        const offers = await Offer.find(query)
            .populate(
                'plan',
                'name durationMonths price gymBranch isActive'
            )
            .sort({
                gymBranch: 1,
                isActive: -1,
                endDate: 1,
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: offers.length,
            offers,
        });
    } catch (error) {
        console.error(
            'Get All Offers Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch offers.',
        });
    }
};

/* =========================================================
   GET OFFERS BY PLAN
   GET /api/offers/plan/:planId
   ========================================================= */

const getOffersByPlan = async(req, res) => {
    try {
        if (!validateOfferAccess(req, res)) {
            return;
        }

        const {
            planId,
        } = req.params;

        if (!isValidObjectId(planId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid membership plan ID.',
            });
        }

        const branch = getAccessibleBranch(req);
        const today = new Date();

        const planQuery = {
            _id: planId,
        };

        if (!isMainAdmin(req)) {
            planQuery.gymBranch = branch;
        }

        const existingPlan =
            await Plan.findOne(planQuery);

        if (!existingPlan) {
            return res.status(404).json({
                success: false,
                message: 'Membership plan not found.',
            });
        }

        const query = {
            plan: existingPlan._id,
            isActive: true,
            startDate: {
                $lte: today,
            },
            endDate: {
                $gte: today,
            },
        };

        if (!isMainAdmin(req)) {
            query.gymBranch = branch;
        }

        const offers = await Offer.find(query)
            .populate(
                'plan',
                'name durationMonths price gymBranch isActive'
            )
            .sort({
                endDate: 1,
            });

        return res.status(200).json({
            success: true,
            count: offers.length,
            offers,
        });
    } catch (error) {
        console.error(
            'Get Offers By Plan Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch offers for this plan.',
        });
    }
};

/* =========================================================
   GET SINGLE OFFER
   GET /api/offers/:id
   ========================================================= */

const getOfferById = async(req, res) => {
    try {
        if (!validateOfferAccess(req, res)) {
            return;
        }

        const {
            id,
        } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid offer ID.',
            });
        }

        const branch = getAccessibleBranch(req);

        const query = {
            _id: id,
        };

        if (!isMainAdmin(req)) {
            query.gymBranch = branch;
        }

        const offer = await Offer.findOne(query)
            .populate(
                'plan',
                'name durationMonths price gymBranch isActive'
            );

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found.',
            });
        }

        return res.status(200).json({
            success: true,
            offer,
        });
    } catch (error) {
        console.error(
            'Get Offer Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch offer.',
        });
    }
};

/* =========================================================
   CREATE OFFER
   POST /api/offers
   ========================================================= */

const createOffer = async(req, res) => {
    try {
        if (!validateOfferAccess(req, res)) {
            return;
        }

        const {
            name,
            plan,
            offerPrice,
            startDate,
            endDate,
            description,
            benefits,
            gymBranch,
        } = req.body;

        const mainAdmin = isMainAdmin(req);
        const accessibleBranch =
            getAccessibleBranch(req);

        /* --------------------------------------------------
           REQUIRED FIELDS
        -------------------------------------------------- */

        if (!name ||
            !String(name).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Offer name is required.',
            });
        }

        if (!plan) {
            return res.status(400).json({
                success: false,
                message: 'Membership plan is required.',
            });
        }

        if (
            offerPrice === undefined ||
            offerPrice === null ||
            offerPrice === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Offer price is required.',
            });
        }

        if (!startDate) {
            return res.status(400).json({
                success: false,
                message: 'Offer start date is required.',
            });
        }

        if (!endDate) {
            return res.status(400).json({
                success: false,
                message: 'Offer end date is required.',
            });
        }

        /* --------------------------------------------------
           VALIDATE PLAN ID
        -------------------------------------------------- */

        if (!isValidObjectId(plan)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid membership plan ID.',
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
            selectedBranch =
                accessibleBranch;
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
           FIND PLAN
        -------------------------------------------------- */

        const existingPlan =
            await Plan.findOne({
                _id: plan,
                gymBranch: selectedBranch,
            });

        if (!existingPlan) {
            return res.status(404).json({
                success: false,
                message: `Membership plan not found for ${selectedBranch}.`,
            });
        }

        if (!existingPlan.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create an offer using an inactive membership plan.',
            });
        }

        /* --------------------------------------------------
           PRICE
        -------------------------------------------------- */

        const parsedPrice =
            Number(offerPrice);

        if (!Number.isFinite(parsedPrice) ||
            parsedPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Offer price must be a valid number greater than or equal to 0.',
            });
        }

        /* --------------------------------------------------
           DATES
        -------------------------------------------------- */

        const parsedStartDate =
            parseDate(startDate);

        const parsedEndDate =
            parseDate(endDate);

        if (!parsedStartDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be a valid date.',
            });
        }

        if (!parsedEndDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be a valid date.',
            });
        }

        if (
            parsedEndDate <
            parsedStartDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'Offer end date cannot be before start date.',
            });
        }

        /* --------------------------------------------------
           NORMALIZE VALUES
        -------------------------------------------------- */

        const normalizedName =
            String(name).trim();

        const normalizedDescription =
            description !== undefined &&
            description !== null ?
            String(description).trim() :
            '';

        const normalizedBenefits =
            normalizeBenefits(benefits);

        /* --------------------------------------------------
           DUPLICATE ACTIVE OFFER
        -------------------------------------------------- */

        const existingOffer =
            await Offer.findOne({
                gymBranch: selectedBranch,
                name: {
                    $regex: `^${escapeRegex(normalizedName)}$`,
                    $options: 'i',
                },
                isActive: true,
            });

        if (existingOffer) {
            return res.status(409).json({
                success: false,
                message: `${normalizedName} offer already exists for ${selectedBranch}.`,
            });
        }

        /* --------------------------------------------------
           CREATE
        -------------------------------------------------- */

        const offer =
            await Offer.create({
                gymBranch: selectedBranch,
                name: normalizedName,
                plan: existingPlan._id,
                offerPrice: parsedPrice,
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                description: normalizedDescription,
                benefits: normalizedBenefits,
                isActive: true,
            });

        const populatedOffer =
            await Offer.findById(
                offer._id
            ).populate(
                'plan',
                'name durationMonths price gymBranch isActive'
            );

        return res.status(201).json({
            success: true,
            message: 'Offer created successfully.',
            offer: populatedOffer,
        });
    } catch (error) {
        console.error(
            'Create Offer Error:',
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An active offer with the same name already exists for this branch.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to create offer.',
        });
    }
};

/* =========================================================
   UPDATE OFFER
   PUT /api/offers/:id
   ========================================================= */

const updateOffer = async(req, res) => {
    try {
        if (!validateOfferAccess(req, res)) {
            return;
        }

        const {
            id,
        } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid offer ID.',
            });
        }

        const mainAdmin =
            isMainAdmin(req);

        const branch =
            getAccessibleBranch(req);

        /* --------------------------------------------------
           FIND OFFER
        -------------------------------------------------- */

        const query = {
            _id: id,
        };

        if (!mainAdmin) {
            query.gymBranch = branch;
        }

        const offer =
            await Offer.findOne(query);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found.',
            });
        }

        const {
            name,
            plan,
            offerPrice,
            startDate,
            endDate,
            description,
            benefits,
            isActive,
            gymBranch,
        } = req.body;

        /* --------------------------------------------------
           FINAL BRANCH
        -------------------------------------------------- */

        let finalBranch;

        if (mainAdmin) {
            finalBranch =
                gymBranch !== undefined &&
                gymBranch !== null &&
                String(gymBranch).trim() !== '' ?
                normalizeBranch(gymBranch) :
                normalizeBranch(
                    offer.gymBranch
                );
        } else {
            finalBranch = branch;
        }

        if (!isValidBranch(finalBranch)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch. Allowed branches are Kalyanpur and Gopalpur.',
            });
        }

        /* --------------------------------------------------
           FINAL ACTIVE STATUS
        -------------------------------------------------- */

        const parsedActive =
            isActive !== undefined ?
            parseBoolean(
                isActive,
                offer.isActive
            ) :
            offer.isActive;

        if (
            typeof parsedActive !==
            'boolean'
        ) {
            return res.status(400).json({
                success: false,
                message: 'isActive must be true or false.',
            });
        }

        /* --------------------------------------------------
           FINAL PLAN
        -------------------------------------------------- */

        let finalPlan;

        if (plan !== undefined) {
            if (!isValidObjectId(plan)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid membership plan ID.',
                });
            }

            finalPlan =
                await Plan.findOne({
                    _id: plan,
                    gymBranch: finalBranch,
                });

            if (!finalPlan) {
                return res.status(404).json({
                    success: false,
                    message: `Membership plan not found for ${finalBranch}.`,
                });
            }
        } else {
            finalPlan =
                await Plan.findOne({
                    _id: offer.plan,
                    gymBranch: finalBranch,
                });

            if (!finalPlan) {
                return res.status(400).json({
                    success: false,
                    message: 'The membership plan does not belong to the selected gym branch.',
                });
            }
        }

        /* --------------------------------------------------
           ACTIVE OFFER REQUIRES ACTIVE PLAN
        -------------------------------------------------- */

        if (
            parsedActive &&
            !finalPlan.isActive
        ) {
            return res.status(400).json({
                success: false,
                message: 'An active offer must be linked to an active membership plan.',
            });
        }

        /* --------------------------------------------------
           FINAL NAME
        -------------------------------------------------- */

        const finalName =
            name !== undefined ?
            String(name).trim() :
            String(offer.name).trim();

        if (!finalName) {
            return res.status(400).json({
                success: false,
                message: 'Offer name cannot be empty.',
            });
        }

        /* --------------------------------------------------
           FINAL PRICE
        -------------------------------------------------- */

        let finalPrice =
            offer.offerPrice;

        if (
            offerPrice !== undefined
        ) {
            finalPrice =
                Number(offerPrice);

            if (!Number.isFinite(
                    finalPrice
                ) ||
                finalPrice < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Offer price must be a valid number greater than or equal to 0.',
                });
            }
        }

        /* --------------------------------------------------
           FINAL DATES
        -------------------------------------------------- */

        let finalStartDate =
            offer.startDate;

        let finalEndDate =
            offer.endDate;

        if (
            startDate !== undefined
        ) {
            finalStartDate =
                parseDate(startDate);

            if (!finalStartDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid start date.',
                });
            }
        }

        if (
            endDate !== undefined
        ) {
            finalEndDate =
                parseDate(endDate);

            if (!finalEndDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid end date.',
                });
            }
        }

        if (
            finalEndDate <
            finalStartDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'Offer end date cannot be before start date.',
            });
        }

        /* --------------------------------------------------
           DUPLICATE ACTIVE OFFER
        -------------------------------------------------- */

        if (parsedActive) {
            const duplicateOffer =
                await Offer.findOne({
                    _id: {
                        $ne: offer._id,
                    },
                    gymBranch: finalBranch,
                    name: {
                        $regex: `^${escapeRegex(finalName)}$`,
                        $options: 'i',
                    },
                    isActive: true,
                });

            if (duplicateOffer) {
                return res.status(409).json({
                    success: false,
                    message: `${finalName} offer already exists for ${finalBranch}.`,
                });
            }
        }

        /* --------------------------------------------------
           UPDATE
        -------------------------------------------------- */

        offer.gymBranch =
            finalBranch;

        offer.name =
            finalName;

        offer.plan =
            finalPlan._id;

        offer.offerPrice =
            finalPrice;

        offer.startDate =
            finalStartDate;

        offer.endDate =
            finalEndDate;

        if (
            description !== undefined
        ) {
            offer.description =
                description !== null ?
                String(
                    description
                ).trim() :
                '';
        }

        if (
            benefits !== undefined
        ) {
            offer.benefits =
                normalizeBenefits(
                    benefits
                );
        }

        offer.isActive =
            parsedActive;

        await offer.save();

        const updatedOffer =
            await Offer.findById(
                offer._id
            ).populate(
                'plan',
                'name durationMonths price gymBranch isActive'
            );

        return res.status(200).json({
            success: true,
            message: 'Offer updated successfully.',
            offer: updatedOffer,
        });
    } catch (error) {
        console.error(
            'Update Offer Error:',
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An active offer with the same name already exists for this branch.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update offer.',
        });
    }
};

/* =========================================================
   DELETE / DEACTIVATE OFFER
   DELETE /api/offers/:id
   ========================================================= */

const deleteOffer = async(req, res) => {
    try {
        if (!validateOfferAccess(req, res)) {
            return;
        }

        const {
            id,
        } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid offer ID.',
            });
        }

        const mainAdmin =
            isMainAdmin(req);

        const branch =
            getAccessibleBranch(req);

        const query = {
            _id: id,
        };

        if (!mainAdmin) {
            query.gymBranch = branch;
        }

        const offer =
            await Offer.findOne(query);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found.',
            });
        }

        offer.isActive = false;

        await offer.save();

        return res.status(200).json({
            success: true,
            message: 'Offer deactivated successfully.',
            offer,
        });
    } catch (error) {
        console.error(
            'Delete Offer Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to deactivate offer.',
        });
    }
};

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
    getOffers,
    getAllOffers,
    getOffersByPlan,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
};