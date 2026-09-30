const mongoose = require('mongoose');
const Offer = require('../models/Offer');


// =========================================================
// CONSTANTS
// =========================================================

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


// =========================================================
// ROLE HELPERS
// =========================================================

const normalizeRole = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase();
};

const getRole = (req) => {
    return normalizeRole(
        req.admin.role
    );
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
        return '';
    }

    if (typeof value === 'object') {
        value =
            value._id ||
            value.name ||
            value.branchName ||
            value.gymBranch ||
            '';
    }

    const normalized =
        String(value)
        .trim()
        .toLowerCase();

    if (
        normalized ===
        'kalyanpur'
    ) {
        return 'Kalyanpur';
    }

    if (
        normalized ===
        'gopalpur'
    ) {
        return 'Gopalpur';
    }

    return '';
};


// =========================================================
// GET ADMIN BRANCHES
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
                    normalizeBranch(
                        branch
                    );

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
        VALID_BRANCHES.includes(
            branch
        )
    );
};


// =========================================================
// VALID BRANCH
// =========================================================

const isValidBranch = (
    branch
) => {
    return VALID_BRANCHES.includes(
        normalizeBranch(branch)
    );
};


// =========================================================
// RESOLVE BRANCH
// =========================================================

const resolveBranch = (
    req,
    requestedBranch, {
        required = true,
    } = {}
) => {

    // -----------------------------------------
    // MAIN ADMIN
    // -----------------------------------------

    if (isMainAdmin(req)) {

        const branch =
            normalizeBranch(
                requestedBranch
            );

        if (!branch &&
            required
        ) {
            return {
                valid: false,
                status: 400,
                message: 'Please select Kalyanpur or Gopalpur.',
            };
        }

        if (
            branch &&
            !isValidBranch(
                branch
            )
        ) {
            return {
                valid: false,
                status: 400,
                message: 'Invalid gym branch.',
            };
        }

        return {
            valid: true,
            branch: branch || null,
        };
    }


    // -----------------------------------------
    // RECEPTIONIST / STAFF
    // -----------------------------------------

    const branches =
        getAdminBranches(req);

    if (
        branches.length === 0
    ) {
        return {
            valid: false,
            status: 403,
            message: 'Your account is not assigned to a valid gym branch.',
        };
    }

    const requested =
        normalizeBranch(
            requestedBranch
        );

    if (requested) {

        if (!branches.includes(
                requested
            )) {
            return {
                valid: false,
                status: 403,
                message: 'You do not have access to the selected gym branch.',
            };
        }

        return {
            valid: true,
            branch: requested,
        };
    }

    // One assigned branch
    if (
        branches.length === 1
    ) {
        return {
            valid: true,
            branch: branches[0],
        };
    }

    if (required) {
        return {
            valid: false,
            status: 400,
            message: 'Please select the active gym branch.',
        };
    }

    return {
        valid: true,
        branch: null,
        branches,
    };
};


// =========================================================
// OFFER ACCESS
// =========================================================

const validateOfferAccess = (
    req,
    res
) => {

    if (!req.admin) {
        res.status(401).json({
            success: false,
            message: 'Not authorized. Please login again.',
        });

        return false;
    }

    const role =
        getRole(req);

    if (
        MAIN_ADMIN_ROLES.includes(
            role
        )
    ) {
        return true;
    }

    if (!BRANCH_USER_ROLES.includes(
            role
        )) {
        res.status(403).json({
            success: false,
            message: 'You are not authorized to access offers.',
        });

        return false;
    }

    const branches =
        getAdminBranches(req);

    if (
        branches.length === 0
    ) {
        res.status(403).json({
            success: false,
            message: 'Your account is not assigned to a valid gym branch.',
        });

        return false;
    }

    return true;
};


// =========================================================
// OBJECT ID
// =========================================================

const isValidObjectId = (
    id
) => {
    return mongoose.Types.ObjectId.isValid(
        id
    );
};


// =========================================================
// BOOLEAN
// =========================================================

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

    if (
        typeof value ===
        'boolean'
    ) {
        return value;
    }

    if (
        typeof value ===
        'string'
    ) {

        const normalized =
            value.trim().toLowerCase();

        if (
            normalized === 'true'
        ) {
            return true;
        }

        if (
            normalized === 'false'
        ) {
            return false;
        }
    }

    return defaultValue;
};


// =========================================================
// DATE
// =========================================================

const parseDate = (
    value
) => {

    if (!value) {
        return null;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date;
};


// =========================================================
// PRICE
// =========================================================

const parsePrice = (
    value
) => {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {
        return null;
    }

    const price =
        Number(value);

    if (!Number.isFinite(price) ||
        price < 0
    ) {
        return null;
    }

    return price;
};


// =========================================================
// DURATION
// =========================================================

const parseDuration = (
    value
) => {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {
        return null;
    }

    const duration =
        Number(value);

    if (!Number.isInteger(
            duration
        ) ||
        duration < 1
    ) {
        return null;
    }

    return duration;
};


// =========================================================
// BENEFITS
// =========================================================

const normalizeBenefits = (
    benefits
) => {

    if (!Array.isArray(
            benefits
        )) {
        return [];
    }

    return [
        ...new Set(
            benefits
            .map(
                (benefit) =>
                String(
                    benefit
                ).trim()
            )
            .filter(Boolean)
        ),
    ];
};


// =========================================================
// DESCRIPTION
// =========================================================

const normalizeDescription = (
    description
) => {

    if (
        description === undefined ||
        description === null
    ) {
        return '';
    }

    return String(
        description
    ).trim();
};


// =========================================================
// NAME
// =========================================================

const normalizeOfferName = (
    name
) => {

    return String(
        name || ''
    ).trim();
};


// =========================================================
// GET ACTIVE OFFERS
// GET /api/offers
// =========================================================

const getOffers = async(
    req,
    res
) => {

    try {

        if (!validateOfferAccess(
                req,
                res
            )) {
            return;
        }

        const requestedBranch =
            req.query.branch;

        const branchResult =
            resolveBranch(
                req,
                requestedBranch, {
                    required:
                        !isMainAdmin(req),
                }
            );

        if (!branchResult.valid) {
            return res.status(
                branchResult.status || 400
            ).json({
                success: false,
                message: branchResult.message,
            });
        }

        const query = {
            isActive: true,
        };

        if (
            branchResult.branch
        ) {
            query.gymBranch =
                branchResult.branch;

        } else if (
            branchResult.branches
        ) {
            query.gymBranch = {
                $in: branchResult.branches,
            };
        }

        const offers =
            await Offer.find(query)
            .sort({
                gymBranch: 1,
                startDate: 1,
                createdAt: -1,
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


// =========================================================
// GET ALL OFFERS
// GET /api/offers/all
// =========================================================

const getAllOffers = async(
    req,
    res
) => {

    try {

        if (!validateOfferAccess(
                req,
                res
            )) {
            return;
        }

        const requestedBranch =
            req.query.branch;

        const branchResult =
            resolveBranch(
                req,
                requestedBranch, {
                    required: false,
                }
            );

        if (!branchResult.valid) {
            return res.status(
                branchResult.status || 400
            ).json({
                success: false,
                message: branchResult.message,
            });
        }

        const query = {};

        if (
            branchResult.branch
        ) {
            query.gymBranch =
                branchResult.branch;

        } else if (
            branchResult.branches
        ) {
            query.gymBranch = {
                $in: branchResult.branches,
            };
        }

        const offers =
            await Offer.find(query)
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


// =========================================================
// PUBLIC OFFERS
// GET /api/offers/public
// =========================================================

const getPublicOffers = async(
    req,
    res
) => {

    try {

        const requestedBranch =
            normalizeBranch(
                req.query.branch
            );

        if (
            requestedBranch &&
            !isValidBranch(
                requestedBranch
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch.',
            });
        }

        const today =
            new Date();

        const query = {
            isActive: true,

            startDate: {
                $lte: today,
            },

            endDate: {
                $gte: today,
            },
        };

        if (
            requestedBranch
        ) {
            query.gymBranch =
                requestedBranch;
        }

        const offers =
            await Offer.find(query)
            .sort({
                gymBranch: 1,
                startDate: 1,
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: offers.length,
            offers,
        });

    } catch (error) {

        console.error(
            'Get Public Offers Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch public offers.',
        });
    }
};


// =========================================================
// GET SINGLE OFFER
// GET /api/offers/:id
// =========================================================

const getOfferById = async(
    req,
    res
) => {

    try {

        if (!validateOfferAccess(
                req,
                res
            )) {
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

        const requestedBranch =
            req.query.branch;

        const branchResult =
            resolveBranch(
                req,
                requestedBranch, {
                    required:
                        !isMainAdmin(req),
                }
            );

        if (!branchResult.valid) {
            return res.status(
                branchResult.status || 400
            ).json({
                success: false,
                message: branchResult.message,
            });
        }

        const query = {
            _id: id,
        };

        if (
            branchResult.branch
        ) {
            query.gymBranch =
                branchResult.branch;

        } else if (
            branchResult.branches
        ) {
            query.gymBranch = {
                $in: branchResult.branches,
            };
        }

        const offer =
            await Offer.findOne(
                query
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


// =========================================================
// CREATE PUJA OFFER
// POST /api/offers
// =========================================================

const createOffer = async(
    req,
    res
) => {

    try {

        if (!validateOfferAccess(
                req,
                res
            )) {
            return;
        }

        const {
            name,
            durationMonths,
            offerPrice,
            startDate,
            endDate,
            description,
            benefits,
            gymBranch,
            image,
            isActive,
        } = req.body;


        // -----------------------------------------
        // NAME
        // -----------------------------------------

        const normalizedName =
            normalizeOfferName(
                name
            );

        if (!normalizedName) {
            return res.status(400).json({
                success: false,
                message: 'Puja offer name is required.',
            });
        }

        if (
            normalizedName.length >
            150
        ) {
            return res.status(400).json({
                success: false,
                message: 'Offer name is too long.',
            });
        }


        // -----------------------------------------
        // BRANCH
        // -----------------------------------------

        const branchResult =
            resolveBranch(
                req,
                gymBranch, {
                    required: true,
                }
            );

        if (!branchResult.valid) {
            return res.status(
                branchResult.status || 400
            ).json({
                success: false,
                message: branchResult.message,
            });
        }

        const selectedBranch =
            branchResult.branch;


        // -----------------------------------------
        // DURATION
        // -----------------------------------------

        const parsedDuration =
            parseDuration(
                durationMonths
            );

        if (
            parsedDuration === null
        ) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be a valid whole number of months greater than 0.',
            });
        }


        // -----------------------------------------
        // PRICE
        // -----------------------------------------

        const parsedPrice =
            parsePrice(
                offerPrice
            );

        if (
            parsedPrice === null
        ) {
            return res.status(400).json({
                success: false,
                message: 'Offer price must be a valid number.',
            });
        }


        // -----------------------------------------
        // DATES
        // -----------------------------------------

        const parsedStartDate =
            parseDate(
                startDate
            );

        const parsedEndDate =
            parseDate(
                endDate
            );

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
                message: 'End date cannot be before start date.',
            });
        }


        // -----------------------------------------
        // DUPLICATE ACTIVE OFFER
        // -----------------------------------------

        const existingOffer =
            await Offer.findOne({
                gymBranch: selectedBranch,

                name: normalizedName,

                isActive: true,
            });

        if (existingOffer) {
            return res.status(409).json({
                success: false,
                message: `An active Puja offer named "${normalizedName}" already exists for ${selectedBranch}.`,
            });
        }


        // -----------------------------------------
        // CREATE
        // -----------------------------------------

        const offer =
            await Offer.create({

                gymBranch: selectedBranch,

                name: normalizedName,

                durationMonths: parsedDuration,

                offerPrice: parsedPrice,

                startDate: parsedStartDate,

                endDate: parsedEndDate,

                description: normalizeDescription(
                    description
                ),

                benefits: normalizeBenefits(
                    benefits
                ),

                image: image ?
                    String(image).trim() : '',

                isActive: parseBoolean(
                    isActive,
                    true
                ),
            });

        return res.status(201).json({
            success: true,
            message: 'Puja offer created successfully.',
            offer,
        });

    } catch (error) {

        console.error(
            'Create Offer Error:',
            error
        );

        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message: 'An active offer of this type already exists for this branch.',
            });
        }

        if (
            error.name ===
            'ValidationError'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Puja offer data.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to create Puja offer.',
        });
    }
};


// =========================================================
// UPDATE PUJA OFFER
// PUT /api/offers/:id
// =========================================================

const updateOffer = async(
    req,
    res
) => {

    try {

        if (!validateOfferAccess(
                req,
                res
            )) {
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


        // -----------------------------------------
        // FIND OFFER WITH ACCESS CONTROL
        // -----------------------------------------

        const requestedBranch =
            req.body.gymBranch ||
            req.query.branch;

        const branchResult =
            resolveBranch(
                req,
                requestedBranch, {
                    required:
                        !isMainAdmin(req),
                }
            );

        if (!branchResult.valid) {
            return res.status(
                branchResult.status || 400
            ).json({
                success: false,
                message: branchResult.message,
            });
        }

        const query = {
            _id: id,
        };

        if (
            branchResult.branch
        ) {
            query.gymBranch =
                branchResult.branch;

        } else if (
            branchResult.branches
        ) {
            query.gymBranch = {
                $in: branchResult.branches,
            };
        }

        const offer =
            await Offer.findOne(
                query
            );

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found.',
            });
        }


        const {
            name,
            durationMonths,
            offerPrice,
            startDate,
            endDate,
            description,
            benefits,
            isActive,
            gymBranch,
            image,
        } = req.body;


        // -----------------------------------------
        // NAME
        // -----------------------------------------

        const finalName =
            name !== undefined ?
            normalizeOfferName(
                name
            ) :
            offer.name;

        if (!finalName) {
            return res.status(400).json({
                success: false,
                message: 'Puja offer name is required.',
            });
        }


        // -----------------------------------------
        // BRANCH
        // -----------------------------------------

        let finalBranch =
            offer.gymBranch;

        if (
            isMainAdmin(req) &&
            gymBranch !== undefined
        ) {
            finalBranch =
                normalizeBranch(
                    gymBranch
                );
        }

        if (!isValidBranch(
                finalBranch
            )) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gym branch.',
            });
        }

        // Branch user cannot move
        // an offer to another branch.

        if (
            isBranchUser(req)
        ) {
            const assignedBranches =
                getAdminBranches(req);

            if (!assignedBranches.includes(
                    finalBranch
                )) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have access to this gym branch.',
                });
            }
        }


        // -----------------------------------------
        // DURATION
        // -----------------------------------------

        let finalDuration =
            offer.durationMonths;

        if (
            durationMonths !==
            undefined
        ) {
            finalDuration =
                parseDuration(
                    durationMonths
                );

            if (
                finalDuration === null
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Duration must be a valid whole number of months greater than 0.',
                });
            }
        }


        // -----------------------------------------
        // PRICE
        // -----------------------------------------

        let finalPrice =
            offer.offerPrice;

        if (
            offerPrice !== undefined
        ) {
            finalPrice =
                parsePrice(
                    offerPrice
                );

            if (
                finalPrice === null
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Offer price must be a valid number.',
                });
            }
        }


        // -----------------------------------------
        // DATES
        // -----------------------------------------

        let finalStartDate =
            offer.startDate;

        let finalEndDate =
            offer.endDate;

        if (
            startDate !== undefined
        ) {
            finalStartDate =
                parseDate(
                    startDate
                );

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
                parseDate(
                    endDate
                );

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
                message: 'End date cannot be before start date.',
            });
        }


        // -----------------------------------------
        // ACTIVE
        // -----------------------------------------

        const finalActive =
            parseBoolean(
                isActive,
                offer.isActive
            );


        // -----------------------------------------
        // DUPLICATE ACTIVE OFFER
        // -----------------------------------------

        if (finalActive) {

            const duplicateOffer =
                await Offer.findOne({
                    _id: {
                        $ne: offer._id,
                    },

                    gymBranch: finalBranch,

                    name: finalName,

                    isActive: true,
                });

            if (duplicateOffer) {
                return res.status(409).json({
                    success: false,
                    message: `An active Puja offer named "${finalName}" already exists for ${finalBranch}.`,
                });
            }
        }


        // -----------------------------------------
        // SAVE
        // -----------------------------------------

        offer.gymBranch =
            finalBranch;

        offer.name =
            finalName;

        offer.durationMonths =
            finalDuration;

        offer.offerPrice =
            finalPrice;

        offer.startDate =
            finalStartDate;

        offer.endDate =
            finalEndDate;

        offer.isActive =
            finalActive;


        if (
            description !==
            undefined
        ) {
            offer.description =
                normalizeDescription(
                    description
                );
        }

        if (
            benefits !==
            undefined
        ) {
            offer.benefits =
                normalizeBenefits(
                    benefits
                );
        }

        if (
            image !==
            undefined
        ) {
            offer.image =
                String(
                    image || ''
                ).trim();
        }

        await offer.save();


        return res.status(200).json({
            success: true,
            message: 'Puja offer updated successfully.',
            offer,
        });

    } catch (error) {

        console.error(
            'Update Offer Error:',
            error
        );

        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message: 'An active offer with the same name already exists for this branch.',
            });
        }

        if (
            error.name ===
            'ValidationError'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Puja offer data.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update Puja offer.',
        });
    }
};


// =========================================================
// DELETE / DEACTIVATE OFFER
// DELETE /api/offers/:id
// =========================================================

const deleteOffer = async(
    req,
    res
) => {

    try {

        if (!validateOfferAccess(
                req,
                res
            )) {
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


        // -----------------------------------------
        // BRANCH ACCESS
        // -----------------------------------------

        const requestedBranch =
            req.query.branch;

        const branchResult =
            resolveBranch(
                req,
                requestedBranch, {
                    required:
                        !isMainAdmin(req),
                }
            );

        if (!branchResult.valid) {
            return res.status(
                branchResult.status || 400
            ).json({
                success: false,
                message: branchResult.message,
            });
        }

        const query = {
            _id: id,
        };

        if (
            branchResult.branch
        ) {
            query.gymBranch =
                branchResult.branch;

        } else if (
            branchResult.branches
        ) {
            query.gymBranch = {
                $in: branchResult.branches,
            };
        }


        // -----------------------------------------
        // FIND
        // -----------------------------------------

        const offer =
            await Offer.findOne(
                query
            );

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found.',
            });
        }


        // -----------------------------------------
        // DEACTIVATE
        // -----------------------------------------

        offer.isActive =
            false;

        await offer.save();


        return res.status(200).json({
            success: true,
            message: 'Puja offer deactivated successfully.',
            offer,
        });

    } catch (error) {

        console.error(
            'Delete Offer Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to deactivate Puja offer.',
        });
    }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    getOffers,
    getAllOffers,
    getPublicOffers,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
};