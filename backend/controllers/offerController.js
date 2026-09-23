const Offer = require('../models/Offer');
const Plan = require('../models/Plan');

/* =========================================================
   CONSTANTS
   ========================================================= */

const VALID_BRANCHES = ['Kalyanpur', 'Gopalpur'];

/* =========================================================
   ADMIN / BRANCH HELPERS
   ========================================================= */

/**
 * Main admin can manage both branches.
 */
const isMainAdmin = (req) => {
    return req.admin && req.admin.role === 'admin';
};

/**
 * Get branch accessible to current user.
 *
 * Main admin:
 *   -> null = both branches
 *
 * Receptionist / branch user:
 *   -> assigned branch
 *
 * Invalid / missing:
 *   -> ''
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
 * Check valid branch.
 */
const isValidBranch = (branch) => {
    return VALID_BRANCHES.includes(branch);
};

/* =========================================================
   REGEX HELPER
   ========================================================= */

/**
 * Escape user-provided text before using it in a regex.
 */
const escapeRegex = (value) => {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/* =========================================================
   GET CURRENT ACTIVE OFFERS
   GET /api/offers
   ========================================================= */

const getOffers = async(req, res) => {
    try {
        const branch = getAccessibleBranch(req);
        const today = new Date();

        /* --------------------------------------------------
           ACCESS VALIDATION
        -------------------------------------------------- */

        if (!isMainAdmin(req) && !branch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        if (!isMainAdmin(req) && !isValidBranch(branch)) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or unsupported gym branch.',
            });
        }

        /* --------------------------------------------------
           BUILD QUERY
        -------------------------------------------------- */

        const query = {
            isActive: true,
            startDate: {
                $lte: today,
            },
            endDate: {
                $gte: today,
            },
        };

        // Receptionist -> own branch only.
        // Main admin -> both branches.
        if (!isMainAdmin(req)) {
            query.gymBranch = branch;
        }

        /* --------------------------------------------------
           FETCH OFFERS
        -------------------------------------------------- */

        const offers = await Offer.find(query)
            .populate(
                'plan',
                'name durationMonths price gymBranch'
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
        console.error('Get Offers Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch offers.',
        });
    }
};

/* =========================================================
   GET ALL OFFERS
   GET /api/offers/all

   Includes inactive / expired offers.
   ========================================================= */

const getAllOffers = async(req, res) => {
    try {
        const branch = getAccessibleBranch(req);

        /* --------------------------------------------------
           ACCESS VALIDATION
        -------------------------------------------------- */

        if (!isMainAdmin(req) && !branch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        if (!isMainAdmin(req) && !isValidBranch(branch)) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or unsupported gym branch.',
            });
        }

        /* --------------------------------------------------
           BUILD QUERY
        -------------------------------------------------- */

        const query = {};

        if (!isMainAdmin(req)) {
            query.gymBranch = branch;
        }

        /* --------------------------------------------------
           FETCH OFFERS
        -------------------------------------------------- */

        const offers = await Offer.find(query)
            .populate(
                'plan',
                'name durationMonths price gymBranch'
            )
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: offers.length,
            offers,
        });
    } catch (error) {
        console.error('Get All Offers Error:', error);

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
        const branch = getAccessibleBranch(req);
        const today = new Date();

        /* --------------------------------------------------
           ACCESS VALIDATION
        -------------------------------------------------- */

        if (!isMainAdmin(req) && !branch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        if (!isMainAdmin(req) && !isValidBranch(branch)) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or unsupported gym branch.',
            });
        }

        /* --------------------------------------------------
           VERIFY PLAN
        -------------------------------------------------- */

        const planQuery = {
            _id: req.params.planId,
        };

        if (!isMainAdmin(req)) {
            planQuery.gymBranch = branch;
        }

        const existingPlan = await Plan.findOne(planQuery);

        if (!existingPlan) {
            return res.status(404).json({
                success: false,
                message: 'Membership plan not found.',
            });
        }

        /* --------------------------------------------------
           BUILD OFFER QUERY
        -------------------------------------------------- */

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

        /* --------------------------------------------------
           FETCH OFFERS
        -------------------------------------------------- */

        const offers = await Offer.find(query)
            .populate(
                'plan',
                'name durationMonths price gymBranch'
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
        console.error('Get Offers By Plan Error:', error);

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
        const branch = getAccessibleBranch(req);

        /* --------------------------------------------------
           ACCESS VALIDATION
        -------------------------------------------------- */

        if (!isMainAdmin(req) && !branch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        if (!isMainAdmin(req) && !isValidBranch(branch)) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or unsupported gym branch.',
            });
        }

        /* --------------------------------------------------
           BUILD QUERY
        -------------------------------------------------- */

        const query = {
            _id: req.params.id,
        };

        if (!isMainAdmin(req)) {
            query.gymBranch = branch;
        }

        /* --------------------------------------------------
           FIND OFFER
        -------------------------------------------------- */

        const offer = await Offer.findOne(query)
            .populate(
                'plan',
                'name durationMonths price gymBranch'
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
        console.error('Get Offer Error:', error);

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
        const accessibleBranch = getAccessibleBranch(req);

        /* --------------------------------------------------
           REQUIRED FIELD VALIDATION
        -------------------------------------------------- */

        if (!name ||
            !String(name).trim() ||
            !plan ||
            offerPrice === undefined ||
            offerPrice === null ||
            offerPrice === '' ||
            !startDate ||
            !endDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'Name, plan, offer price, start date and end date are required.',
            });
        }

        /* --------------------------------------------------
           DETERMINE BRANCH
        -------------------------------------------------- */

        let selectedBranch;

        if (mainAdmin) {
            // Main admin must explicitly choose branch.
            selectedBranch =
                gymBranch !== undefined &&
                gymBranch !== null ?
                String(gymBranch).trim() :
                '';
        } else {
            // Receptionist uses authenticated assigned branch.
            selectedBranch = accessibleBranch;
        }

        /* --------------------------------------------------
           VALIDATE BRANCH
        -------------------------------------------------- */

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

        if (!mainAdmin &&
            !isValidBranch(accessibleBranch)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        /* --------------------------------------------------
           CHECK MEMBERSHIP PLAN
        -------------------------------------------------- */

        // Plan MUST belong to the selected branch.
        const existingPlan = await Plan.findOne({
            _id: plan,
            gymBranch: selectedBranch,
        });

        if (!existingPlan) {
            return res.status(404).json({
                success: false,
                message: `Membership plan not found for ${selectedBranch}.`,
            });
        }

        // New offers cannot use inactive plans.
        if (!existingPlan.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create an offer using an inactive membership plan.',
            });
        }

        /* --------------------------------------------------
           VALIDATE OFFER PRICE
        -------------------------------------------------- */

        const price = Number(offerPrice);

        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Offer price must be a valid number greater than or equal to 0.',
            });
        }

        /* --------------------------------------------------
           VALIDATE DATES
        -------------------------------------------------- */

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date must be valid dates.',
            });
        }

        if (end < start) {
            return res.status(400).json({
                success: false,
                message: 'Offer end date cannot be before start date.',
            });
        }

        /* --------------------------------------------------
           NORMALIZE VALUES
        -------------------------------------------------- */

        const normalizedName = String(name).trim();

        const normalizedDescription =
            description !== undefined &&
            description !== null ?
            String(description).trim() :
            '';

        const normalizedBenefits =
            Array.isArray(benefits) ?
            benefits
            .map((benefit) =>
                String(benefit).trim()
            )
            .filter(Boolean) :
            [];

        /* --------------------------------------------------
           DUPLICATE ACTIVE OFFER CHECK
        -------------------------------------------------- */

        const existingOffer = await Offer.findOne({
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
           CREATE OFFER
        -------------------------------------------------- */

        const offer = await Offer.create({
            gymBranch: selectedBranch,
            name: normalizedName,
            plan: existingPlan._id,
            offerPrice: price,
            startDate: start,
            endDate: end,
            description: normalizedDescription,
            benefits: normalizedBenefits,
            isActive: true,
        });

        /* --------------------------------------------------
           POPULATE OFFER
        -------------------------------------------------- */

        const populatedOffer = await Offer.findById(offer._id)
            .populate(
                'plan',
                'name durationMonths price gymBranch'
            );

        return res.status(201).json({
            success: true,
            message: 'Offer created successfully.',
            offer: populatedOffer,
        });
    } catch (error) {
        console.error('Create Offer Error:', error);

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
        const branch = getAccessibleBranch(req);
        const mainAdmin = isMainAdmin(req);

        /* --------------------------------------------------
           ACCESS VALIDATION
        -------------------------------------------------- */

        if (!mainAdmin && !branch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        if (!mainAdmin &&
            !isValidBranch(branch)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or unsupported gym branch.',
            });
        }

        /* --------------------------------------------------
           FIND OFFER
        -------------------------------------------------- */

        const query = {
            _id: req.params.id,
        };

        if (!mainAdmin) {
            query.gymBranch = branch;
        }

        const offer = await Offer.findOne(query);

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
           DETERMINE FINAL BRANCH
        -------------------------------------------------- */

        let finalBranch;

        if (mainAdmin) {
            // Main admin may move an offer between branches.
            finalBranch =
                gymBranch !== undefined &&
                gymBranch !== null &&
                String(gymBranch).trim() !== '' ?
                String(gymBranch).trim() :
                offer.gymBranch;
        } else {
            // Receptionist cannot change branch.
            finalBranch = branch;
        }

        if (!isValidBranch(finalBranch)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch. Allowed branches are Kalyanpur and Gopalpur.',
            });
        }

        /* --------------------------------------------------
           DETERMINE FINAL ACTIVE STATUS
        -------------------------------------------------- */

        const finalIsActive =
            isActive !== undefined ?
            Boolean(isActive) :
            offer.isActive;

        /* --------------------------------------------------
           DETERMINE FINAL PLAN
        -------------------------------------------------- */

        let finalPlan;

        if (plan !== undefined) {
            // Requested plan must belong to final branch.
            const requestedPlan = await Plan.findOne({
                _id: plan,
                gymBranch: finalBranch,
            });

            if (!requestedPlan) {
                return res.status(404).json({
                    success: false,
                    message: `Membership plan not found for ${finalBranch}.`,
                });
            }

            if (
                finalIsActive &&
                !requestedPlan.isActive
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'An active offer cannot use an inactive membership plan.',
                });
            }

            finalPlan = requestedPlan;
        } else {
            // Existing plan must belong to final branch.
            finalPlan = await Plan.findOne({
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
           ACTIVE OFFER -> ACTIVE PLAN
        -------------------------------------------------- */

        if (
            finalIsActive &&
            !finalPlan.isActive
        ) {
            return res.status(400).json({
                success: false,
                message: 'An active offer must be linked to an active membership plan.',
            });
        }

        /* --------------------------------------------------
           DETERMINE FINAL NAME
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
           DETERMINE FINAL PRICE
        -------------------------------------------------- */

        let finalPrice = offer.offerPrice;

        if (offerPrice !== undefined) {
            finalPrice = Number(offerPrice);

            if (!Number.isFinite(finalPrice) ||
                finalPrice < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Offer price must be a valid number greater than or equal to 0.',
                });
            }
        }

        /* --------------------------------------------------
           DETERMINE FINAL DATES
        -------------------------------------------------- */

        let finalStartDate = offer.startDate;
        let finalEndDate = offer.endDate;

        if (startDate !== undefined) {
            finalStartDate = new Date(startDate);

            if (
                Number.isNaN(
                    finalStartDate.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid start date.',
                });
            }
        }

        if (endDate !== undefined) {
            finalEndDate = new Date(endDate);

            if (
                Number.isNaN(
                    finalEndDate.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid end date.',
                });
            }
        }

        if (
            finalEndDate < finalStartDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'Offer end date cannot be before start date.',
            });
        }

        /* --------------------------------------------------
           DUPLICATE ACTIVE OFFER CHECK
        -------------------------------------------------- */

        if (finalIsActive) {
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
           UPDATE OFFER
        -------------------------------------------------- */

        offer.gymBranch = finalBranch;
        offer.name = finalName;
        offer.plan = finalPlan._id;
        offer.offerPrice = finalPrice;
        offer.startDate = finalStartDate;
        offer.endDate = finalEndDate;

        if (description !== undefined) {
            offer.description =
                description !== null ?
                String(description).trim() :
                '';
        }

        if (benefits !== undefined) {
            offer.benefits =
                Array.isArray(benefits) ?
                benefits
                .map((benefit) =>
                    String(benefit).trim()
                )
                .filter(Boolean) :
                [];
        }

        offer.isActive = finalIsActive;

        await offer.save();

        /* --------------------------------------------------
           POPULATE UPDATED OFFER
        -------------------------------------------------- */

        const updatedOffer =
            await Offer.findById(offer._id)
            .populate(
                'plan',
                'name durationMonths price gymBranch'
            );

        return res.status(200).json({
            success: true,
            message: 'Offer updated successfully.',
            offer: updatedOffer,
        });
    } catch (error) {
        console.error('Update Offer Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update offer.',
        });
    }
};

/* =========================================================
   DEACTIVATE OFFER
   DELETE /api/offers/:id

   Soft delete:
   isActive = false
   ========================================================= */

const deleteOffer = async(req, res) => {
    try {
        const branch = getAccessibleBranch(req);
        const mainAdmin = isMainAdmin(req);

        /* --------------------------------------------------
           ACCESS VALIDATION
        -------------------------------------------------- */

        if (!mainAdmin && !branch) {
            return res.status(403).json({
                success: false,
                message: 'Your account is not assigned to a gym branch. Please contact the main administrator.',
            });
        }

        if (!mainAdmin &&
            !isValidBranch(branch)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or unsupported gym branch.',
            });
        }

        /* --------------------------------------------------
           FIND OFFER
        -------------------------------------------------- */

        const query = {
            _id: req.params.id,
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

        /* --------------------------------------------------
           SOFT DELETE
        -------------------------------------------------- */

        offer.isActive = false;

        await offer.save();

        return res.status(200).json({
            success: true,
            message: 'Offer deactivated successfully.',
            offer,
        });
    } catch (error) {
        console.error('Delete Offer Error:', error);

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