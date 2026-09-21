const Offer = require('../models/Offer');
const Plan = require('../models/Plan');


// =========================================
// GET ACCESSIBLE BRANCH
// =========================================

const getAccessibleBranch = (req) => {

    // Main admin can manage both branches
    if (req.admin && req.admin.role === 'admin') {
        return null;
    }

    // Receptionist is restricted to assigned branch
    if (req.admin && req.admin.gymBranch) {
        return req.admin.gymBranch;
    }

    // Fallback for old accounts
    return 'Kalyanpur';
};


// =========================================
// GET CURRENT ACTIVE OFFERS
// =========================================

const getOffers = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);

        const today =
            new Date();


        // =========================================
        // BUILD QUERY
        // =========================================

        const query = {

            isActive: true,

            startDate: {
                $lte: today,
            },

            endDate: {
                $gte: today,
            },

        };


        // Branch restriction
        if (branch) {
            query.gymBranch = branch;
        }


        const offers =
            await Offer.find(query)

        .populate(
            'plan',
            'name durationMonths price'
        )

        .sort({
            endDate: 1,
        });


        res.status(200).json({

            offers,

        });

    } catch (error) {

        console.error(
            'Get Offers Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to fetch offers.',

        });
    }
};


// =========================================
// GET ALL OFFERS
// =========================================

const getAllOffers = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // BUILD QUERY
        // =========================================

        const query =
            branch ?
            { gymBranch: branch } :
            {};


        const offers =
            await Offer.find(query)

        .populate(
            'plan',
            'name durationMonths price'
        )

        .sort({
            createdAt: -1,
        });


        res.status(200).json({

            offers,

        });

    } catch (error) {

        console.error(
            'Get All Offers Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to fetch offers.',

        });
    }
};


// =========================================
// GET OFFERS BY PLAN
// =========================================

const getOffersByPlan = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);

        const today =
            new Date();


        // =========================================
        // BUILD QUERY
        // =========================================

        const query = {

            plan: req.params.planId,

            isActive: true,

            startDate: {
                $lte: today,
            },

            endDate: {
                $gte: today,
            },

        };


        if (branch) {
            query.gymBranch = branch;
        }


        const offers =
            await Offer.find(query)

        .populate(
            'plan',
            'name durationMonths price'
        )

        .sort({
            endDate: 1,
        });


        res.status(200).json({

            offers,

        });

    } catch (error) {

        console.error(
            'Get Offers By Plan Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to fetch offers for this plan.',

        });
    }
};


// =========================================
// GET SINGLE OFFER
// =========================================

const getOfferById = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // BUILD QUERY
        // =========================================

        const query = {

            _id: req.params.id,

        };


        if (branch) {
            query.gymBranch = branch;
        }


        const offer =
            await Offer.findOne(query)

        .populate(
            'plan',
            'name durationMonths price'
        );


        if (!offer) {

            return res.status(404).json({

                message: 'Offer not found.',

            });
        }


        res.status(200).json({

            offer,

        });

    } catch (error) {

        console.error(
            'Get Offer Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to fetch offer.',

        });
    }
};


// =========================================
// CREATE OFFER
// =========================================

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


        // =========================================
        // VALIDATION
        // =========================================

        if (!name ||
            !plan ||
            offerPrice === undefined ||
            !startDate ||
            !endDate
        ) {

            return res.status(400).json({

                message: 'Name, plan, offer price, start date and end date are required.',

            });
        }


        // =========================================
        // DETERMINE BRANCH
        // =========================================

        let selectedBranch;


        if (
            req.admin &&
            req.admin.role === 'admin'
        ) {

            // Main admin can select branch
            selectedBranch =
                gymBranch || 'Kalyanpur';

        } else {

            // Receptionist uses assigned branch
            selectedBranch =
                (req.admin && req.admin.gymBranch) ?
                req.admin.gymBranch :
                'Kalyanpur';
        }


        // =========================================
        // VALIDATE BRANCH
        // =========================================

        const allowedBranches = [
            'Kalyanpur',
            'Gopalpur',
        ];


        if (!allowedBranches.includes(
                selectedBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        // =========================================
        // CHECK MEMBERSHIP PLAN
        // =========================================

        const existingPlan =
            await Plan.findById(plan);


        if (!existingPlan) {

            return res.status(404).json({

                message: 'Membership plan not found.',

            });
        }


        // =========================================
        // CHECK PLAN BRANCH
        // =========================================

        if (
            existingPlan.gymBranch &&
            existingPlan.gymBranch !== selectedBranch
        ) {

            return res.status(400).json({

                message: 'Membership plan does not belong to the selected gym branch.',

            });
        }


        // =========================================
        // VALIDATE PRICE
        // =========================================

        const price =
            Number(offerPrice);


        if (
            Number.isNaN(price) ||
            price < 0
        ) {

            return res.status(400).json({

                message: 'Offer price must be a valid positive number.',

            });
        }


        // =========================================
        // VALIDATE DATES
        // =========================================

        const start =
            new Date(startDate);


        const end =
            new Date(endDate);


        if (
            Number.isNaN(
                start.getTime()
            ) ||
            Number.isNaN(
                end.getTime()
            )
        ) {

            return res.status(400).json({

                message: 'Start date and end date must be valid dates.',

            });
        }


        if (end < start) {

            return res.status(400).json({

                message: 'Offer end date cannot be before start date.',

            });
        }


        // =========================================
        // CREATE OFFER
        // =========================================

        const offer =
            await Offer.create({

                gymBranch: selectedBranch,

                name: name.trim(),

                plan,

                offerPrice: price,

                startDate: start,

                endDate: end,

                description: description ?
                    description.trim() :
                    '',

                benefits: Array.isArray(benefits) ?
                    benefits :
                    [],

            });


        // =========================================
        // POPULATE OFFER
        // =========================================

        const populatedOffer =
            await Offer.findById(
                offer._id
            )

        .populate(
            'plan',
            'name durationMonths price'
        );


        res.status(201).json({

            message: 'Offer created successfully.',

            offer: populatedOffer,

        });

    } catch (error) {

        console.error(
            'Create Offer Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to create offer.',

        });
    }
};


// =========================================
// UPDATE OFFER
// =========================================

const updateOffer = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // FIND OFFER
        // =========================================

        const query = {

            _id: req.params.id,

        };


        if (branch) {
            query.gymBranch = branch;
        }


        const offer =
            await Offer.findOne(query);


        if (!offer) {

            return res.status(404).json({

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


        // =========================================
        // DETERMINE FINAL BRANCH
        // =========================================

        let finalBranch;


        if (branch) {

            // Receptionist cannot change branch
            finalBranch =
                branch;

        } else {

            // Main admin can change branch
            finalBranch =
                gymBranch ||
                offer.gymBranch ||
                'Kalyanpur';
        }


        // =========================================
        // VALIDATE FINAL BRANCH
        // =========================================

        const allowedBranches = [
            'Kalyanpur',
            'Gopalpur',
        ];


        if (!allowedBranches.includes(
                finalBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        // =========================================
        // UPDATE PLAN
        // =========================================

        if (plan !== undefined) {

            const existingPlan =
                await Plan.findById(plan);


            if (!existingPlan) {

                return res.status(404).json({

                    message: 'Membership plan not found.',

                });
            }


            // Plan must belong to same branch
            if (
                existingPlan.gymBranch &&
                existingPlan.gymBranch !== finalBranch
            ) {

                return res.status(400).json({

                    message: 'Membership plan does not belong to the selected gym branch.',

                });
            }


            offer.plan =
                plan;
        }


        // =========================================
        // UPDATE NAME
        // =========================================

        if (name !== undefined) {

            offer.name =
                name.trim();
        }


        // =========================================
        // UPDATE PRICE
        // =========================================

        if (
            offerPrice !== undefined
        ) {

            const price =
                Number(offerPrice);


            if (
                Number.isNaN(price) ||
                price < 0
            ) {

                return res.status(400).json({

                    message: 'Offer price must be a valid positive number.',

                });
            }


            offer.offerPrice =
                price;
        }


        // =========================================
        // UPDATE START DATE
        // =========================================

        if (
            startDate !== undefined
        ) {

            const start =
                new Date(startDate);


            if (
                Number.isNaN(
                    start.getTime()
                )
            ) {

                return res.status(400).json({

                    message: 'Invalid start date.',

                });
            }


            offer.startDate =
                start;
        }


        // =========================================
        // UPDATE END DATE
        // =========================================

        if (
            endDate !== undefined
        ) {

            const end =
                new Date(endDate);


            if (
                Number.isNaN(
                    end.getTime()
                )
            ) {

                return res.status(400).json({

                    message: 'Invalid end date.',

                });
            }


            offer.endDate =
                end;
        }


        // =========================================
        // UPDATE DESCRIPTION
        // =========================================

        if (
            description !== undefined
        ) {

            offer.description =
                description.trim();
        }


        // =========================================
        // UPDATE BENEFITS
        // =========================================

        if (
            benefits !== undefined
        ) {

            offer.benefits =
                Array.isArray(benefits) ?
                benefits :
                [];
        }


        // =========================================
        // UPDATE ACTIVE STATUS
        // =========================================

        if (
            isActive !== undefined
        ) {

            offer.isActive =
                Boolean(isActive);
        }


        // =========================================
        // UPDATE BRANCH
        // =========================================

        offer.gymBranch =
            finalBranch;


        // =========================================
        // VALIDATE DATE RANGE
        // =========================================

        if (
            offer.endDate <
            offer.startDate
        ) {

            return res.status(400).json({

                message: 'Offer end date cannot be before start date.',

            });
        }


        // =========================================
        // SAVE
        // =========================================

        await offer.save();


        // =========================================
        // POPULATE UPDATED OFFER
        // =========================================

        const updatedOffer =
            await Offer.findById(
                offer._id
            )

        .populate(
            'plan',
            'name durationMonths price'
        );


        res.status(200).json({

            message: 'Offer updated successfully.',

            offer: updatedOffer,

        });

    } catch (error) {

        console.error(
            'Update Offer Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to update offer.',

        });
    }
};


// =========================================
// DEACTIVATE OFFER
// =========================================

const deleteOffer = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // BUILD QUERY
        // =========================================

        const query = {

            _id: req.params.id,

        };


        if (branch) {
            query.gymBranch = branch;
        }


        const offer =
            await Offer.findOne(query);


        if (!offer) {

            return res.status(404).json({

                message: 'Offer not found.',

            });
        }


        offer.isActive =
            false;


        await offer.save();


        res.status(200).json({

            message: 'Offer deactivated successfully.',

        });

    } catch (error) {

        console.error(
            'Delete Offer Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to deactivate offer.',

        });
    }
};


// =========================================
// EXPORTS
// =========================================

module.exports = {

    getOffers,

    getAllOffers,

    getOffersByPlan,

    getOfferById,

    createOffer,

    updateOffer,

    deleteOffer,

};