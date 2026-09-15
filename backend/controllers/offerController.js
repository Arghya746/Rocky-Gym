const Offer = require('../models/Offer');
const Plan = require('../models/Plan');


// =========================================
// GET CURRENT ACTIVE OFFERS
// =========================================

const getOffers = async(req, res) => {
    try {

        const today = new Date();

        const offers = await Offer.find({
                isActive: true,
                startDate: {
                    $lte: today,
                },
                endDate: {
                    $gte: today,
                },
            })
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

        const offers = await Offer.find()
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

        const today = new Date();

        const offers = await Offer.find({
                plan: req.params.planId,
                isActive: true,
                startDate: {
                    $lte: today,
                },
                endDate: {
                    $gte: today,
                },
            })
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

        const offer =
            await Offer.findById(req.params.id)
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
        } = req.body;


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


        // Check membership plan
        const existingPlan =
            await Plan.findById(plan);

        if (!existingPlan) {
            return res.status(404).json({
                message: 'Membership plan not found.',
            });
        }


        // Validate price
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


        // Validate dates
        const start =
            new Date(startDate);

        const end =
            new Date(endDate);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
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


        const offer =
            await Offer.create({

                name: name.trim(),

                plan,

                offerPrice: price,

                startDate: start,

                endDate: end,

                description: description ?
                    description.trim() : '',

                benefits: Array.isArray(benefits) ?
                    benefits : [],

            });


        const populatedOffer =
            await Offer.findById(
                offer._id
            ).populate(
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

        const offer =
            await Offer.findById(
                req.params.id
            );

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
        } = req.body;


        // Update plan
        if (plan !== undefined) {

            const existingPlan =
                await Plan.findById(plan);

            if (!existingPlan) {
                return res.status(404).json({
                    message: 'Membership plan not found.',
                });
            }

            offer.plan = plan;
        }


        // Update name
        if (name !== undefined) {
            offer.name =
                name.trim();
        }


        // Update price
        if (offerPrice !== undefined) {

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


        // Update start date
        if (startDate !== undefined) {

            const start =
                new Date(startDate);

            if (Number.isNaN(start.getTime())) {
                return res.status(400).json({
                    message: 'Invalid start date.',
                });
            }

            offer.startDate =
                start;
        }


        // Update end date
        if (endDate !== undefined) {

            const end =
                new Date(endDate);

            if (Number.isNaN(end.getTime())) {
                return res.status(400).json({
                    message: 'Invalid end date.',
                });
            }

            offer.endDate =
                end;
        }


        // Update description
        if (description !== undefined) {

            offer.description =
                description.trim();
        }


        // Update benefits
        if (benefits !== undefined) {

            offer.benefits =
                Array.isArray(benefits) ?
                benefits : [];
        }


        // Update active status
        if (isActive !== undefined) {

            offer.isActive =
                Boolean(isActive);
        }


        // Validate date range
        if (
            offer.endDate <
            offer.startDate
        ) {
            return res.status(400).json({
                message: 'Offer end date cannot be before start date.',
            });
        }


        await offer.save();


        const updatedOffer =
            await Offer.findById(
                offer._id
            ).populate(
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

        const offer =
            await Offer.findById(
                req.params.id
            );

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