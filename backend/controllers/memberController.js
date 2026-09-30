const Member = require('../models/Member');
const Offer = require('../models/Offer');

const {
    VALID_BRANCHES: ALLOWED_BRANCHES,
    normalizeBranch,
    getActiveBranch,
    getAccessibleBranches,
    getBranchFilter,
    resolveWriteBranch,
    isReceptionRequest,
} = require('../utils/branchAccess');


// =========================================================
// ROLES
// =========================================================

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

const getRole = (req) => {
    return String(
            req.admin.role || ''
        )
        .trim()
        .toLowerCase();
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

const getAccessibleBranch = (req) => {
    return getActiveBranch(req);
};

const getWriteBranch = (
    req,
    requestedBranch
) => {
    return resolveWriteBranch(
        req,
        requestedBranch
    );
};


// =========================================================
// OBJECT ID
// =========================================================

const isValidObjectId = (value) => {
    return /^[a-fA-F0-9]{24}$/.test(
        String(value || '')
    );
};


// =========================================================
// SERVER ERROR
// =========================================================

const sendServerError = (
    res,
    message
) => {
    return res.status(500).json({
        message: message ||
            'Server error. Please try again.',
    });
};


// =========================================================
// OFFER POPULATE
// =========================================================

const OFFER_FIELDS = [
    'name',
    'durationMonths',
    'offerPrice',
    'description',
    'benefits',
    'image',
    'gymBranch',
    'startDate',
    'endDate',
    'isActive',
].join(' ');


// =========================================================
// VALIDATE OFFER
// =========================================================

const validateOfferForMember = async(
    offerId,
    selectedBranch, {
        requireActive = true,
    } = {}
) => {

    if (!offerId) {
        return {
            valid: true,
            offer: null,
        };
    }

    if (!isValidObjectId(
            offerId
        )) {
        return {
            valid: false,
            status: 400,
            message: 'Invalid Puja offer ID.',
        };
    }

    const offer =
        await Offer.findOne({
            _id: offerId,

            gymBranch: selectedBranch,
        });

    if (!offer) {
        return {
            valid: false,
            status: 404,
            message: 'Selected Puja offer was not found for this gym branch.',
        };
    }

    if (
        requireActive &&
        offer.isActive === false
    ) {
        return {
            valid: false,
            status: 400,
            message: 'The selected Puja offer is inactive.',
        };
    }

    if (requireActive) {
        const now =
            new Date();

        const startDate =
            new Date(
                offer.startDate
            );

        const endDate =
            new Date(
                offer.endDate
            );

        if (
            startDate > now ||
            endDate < now
        ) {
            return {
                valid: false,
                status: 400,
                message: 'The selected Puja offer is not currently active.',
            };
        }
    }

    return {
        valid: true,
        offer,
    };
};


// =========================================================
// ADD MEMBER
// =========================================================

const addMember = async(
    req,
    res
) => {
    try {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const {
            name,
            phone,
            email,
            age,
            gender,
            membershipOffer,
            membershipStartDate,
            membershipEndDate,
            amount,
            gymBranch,
        } = req.body;


        // -----------------------------------------
        // REQUIRED FIELDS
        // -----------------------------------------

        if (!name ||
            !phone ||
            !membershipStartDate ||
            !membershipEndDate ||
            amount === undefined ||
            amount === null
        ) {
            return res.status(400).json({
                message: 'Required member details are missing.',
            });
        }


        // -----------------------------------------
        // BRANCH
        // -----------------------------------------

        const branchResult =
            getWriteBranch(
                req,
                gymBranch
            );

        if (
            branchResult.error
        ) {
            return res.status(
                branchResult.status || 400
            ).json({
                message: branchResult.error,
            });
        }

        const selectedBranch =
            normalizeBranch(
                branchResult.branch
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
        // OFFER
        // -----------------------------------------

        let selectedOffer =
            null;

        if (membershipOffer) {

            const offerResult =
                await validateOfferForMember(
                    membershipOffer,
                    selectedBranch
                );

            if (!offerResult.valid) {
                return res.status(
                    offerResult.status || 400
                ).json({
                    message: offerResult.message,
                });
            }

            selectedOffer =
                offerResult.offer;
        }


        // -----------------------------------------
        // CREATE MEMBER
        // -----------------------------------------

        const member =
            await Member.create({

                gymBranch: selectedBranch,

                name: String(name).trim(),

                phone: String(phone).trim(),

                email: email ?
                    String(email)
                    .trim()
                    .toLowerCase() : '',

                age,

                gender,

                membershipOffer: selectedOffer ?
                    selectedOffer._id : null,

                membershipStartDate,

                membershipEndDate,

                amount,
            });


        // -----------------------------------------
        // POPULATE
        // -----------------------------------------

        const populatedMember =
            await Member.findById(
                member._id
            ).populate(
                'membershipOffer',
                OFFER_FIELDS
            );


        return res.status(201).json({
            message: 'Member added successfully.',

            member: populatedMember,
        });

    } catch (error) {

        console.error(
            'Add Member Error:',
            error
        );

        return sendServerError(
            res
        );
    }
};


// =========================================================
// GET MEMBERS
// =========================================================

const getMembers = async(
    req,
    res
) => {
    try {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const accessibleBranches =
            getAccessibleBranches(req);

        if (
            isReceptionRequest(req) &&
            accessibleBranches.length === 0
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        const query =
            getBranchFilter(req);

        const members =
            await Member.find(query)
            .populate(
                'membershipOffer',
                OFFER_FIELDS
            )
            .sort({
                createdAt: -1,
            });


        // -----------------------------------------
        // AUTOMATIC EXPIRY
        // -----------------------------------------

        const today =
            new Date();

        const updatedMembers =
            await Promise.all(
                members.map(
                    async(member) => {

                        if (
                            member.membershipEndDate &&
                            new Date(
                                member.membershipEndDate
                            ) < today &&
                            member.status !==
                            'Expired'
                        ) {
                            member.status =
                                'Expired';

                            await member.save();
                        }

                        return member;
                    }
                )
            );


        return res.status(200).json({
            message: 'Members fetched successfully.',

            members: updatedMembers,
        });

    } catch (error) {

        console.error(
            'Get Members Error:',
            error
        );

        return sendServerError(
            res
        );
    }
};


// =========================================================
// GET MEMBER BY ID
// =========================================================

const getMemberById = async(
    req,
    res
) => {
    try {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        if (!isValidObjectId(
                req.params.id
            )) {
            return res.status(400).json({
                message: 'Invalid member ID.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        if (
            isBranchUser(req) &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch =
                branch;
        }

        const member =
            await Member.findOne(
                query
            ).populate(
                'membershipOffer',
                OFFER_FIELDS
            );

        if (!member) {
            return res.status(404).json({
                message: 'Member not found.',
            });
        }


        // -----------------------------------------
        // AUTOMATIC EXPIRY
        // -----------------------------------------

        const today =
            new Date();

        if (
            member.membershipEndDate &&
            new Date(
                member.membershipEndDate
            ) < today &&
            member.status !== 'Expired'
        ) {
            member.status =
                'Expired';

            await member.save();
        }

        return res.status(200).json({
            member,
        });

    } catch (error) {

        console.error(
            'Get Member Error:',
            error
        );

        return sendServerError(
            res
        );
    }
};


// =========================================================
// UPDATE MEMBER
// =========================================================

const updateMember = async(
    req,
    res
) => {
    try {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        if (!isValidObjectId(
                req.params.id
            )) {
            return res.status(400).json({
                message: 'Invalid member ID.',
            });
        }

        const role =
            getRole(req);

        if (!MAIN_ADMIN_ROLES.includes(
                role
            ) &&
            !BRANCH_USER_ROLES.includes(
                role
            )
        ) {
            return res.status(403).json({
                message: 'You do not have permission to update members.',
            });
        }


        // -----------------------------------------
        // CURRENT BRANCH
        // -----------------------------------------

        const branch =
            getAccessibleBranch(req);

        if (
            isBranchUser(req) &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }


        // -----------------------------------------
        // FIND MEMBER
        // -----------------------------------------

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch =
                branch;
        }

        const existingMember =
            await Member.findOne(
                query
            );

        if (!existingMember) {
            return res.status(404).json({
                message: 'Member not found.',
            });
        }


        // -----------------------------------------
        // COPY REQUEST
        // -----------------------------------------

        const updateData = {
            ...req.body,
        };


        // Never allow these
        // to be modified.

        delete updateData._id;
        delete updateData.__v;

        // Explicitly remove old Plan
        // field if an old frontend sends it.

        delete updateData.membershipPlan;

        // Never allow arbitrary plan references.

        delete updateData.plan;


        // -----------------------------------------
        // BRANCH PROTECTION
        // -----------------------------------------

        if (isBranchUser(req)) {

            updateData.gymBranch =
                branch;

        } else if (
            isMainAdmin(req)
        ) {

            if (
                updateData.gymBranch !==
                undefined
            ) {

                const requestedBranch =
                    normalizeBranch(
                        updateData.gymBranch
                    );

                if (!requestedBranch) {
                    return res.status(400).json({
                        message: 'Invalid gym branch.',
                    });
                }

                updateData.gymBranch =
                    requestedBranch;

            } else {

                updateData.gymBranch =
                    normalizeBranch(
                        existingMember.gymBranch
                    );
            }
        }


        // -----------------------------------------
        // FINAL BRANCH VALIDATION
        // -----------------------------------------

        if (!ALLOWED_BRANCHES.includes(
                updateData.gymBranch
            )) {
            return res.status(400).json({
                message: 'A valid gym branch is required.',
            });
        }


        // -----------------------------------------
        // OFFER
        // -----------------------------------------

        if (
            updateData.membershipOffer !==
            undefined
        ) {

            if (
                updateData.membershipOffer ===
                null ||
                updateData.membershipOffer ===
                ''
            ) {

                updateData.membershipOffer =
                    null;

            } else {

                const offerResult =
                    await validateOfferForMember(
                        updateData.membershipOffer,
                        updateData.gymBranch, {
                            requireActive: false,
                        }
                    );

                if (!offerResult.valid) {
                    return res.status(
                        offerResult.status ||
                        400
                    ).json({
                        message: offerResult.message,
                    });
                }

                updateData.membershipOffer =
                    offerResult.offer._id;
            }
        }


        // -----------------------------------------
        // UPDATE
        // -----------------------------------------

        const member =
            await Member.findByIdAndUpdate(
                req.params.id,
                updateData, {
                    new: true,
                    runValidators: true,
                }
            ).populate(
                'membershipOffer',
                OFFER_FIELDS
            );

        if (!member) {
            return res.status(404).json({
                message: 'Member not found.',
            });
        }

        return res.status(200).json({
            message: 'Member updated successfully.',

            member,
        });

    } catch (error) {

        console.error(
            'Update Member Error:',
            error
        );

        return sendServerError(
            res
        );
    }
};


// =========================================================
// DELETE MEMBER
// =========================================================

const deleteMember = async(
    req,
    res
) => {
    try {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        if (!isValidObjectId(
                req.params.id
            )) {
            return res.status(400).json({
                message: 'Invalid member ID.',
            });
        }

        const role =
            getRole(req);

        if (!MAIN_ADMIN_ROLES.includes(
                role
            ) &&
            !BRANCH_USER_ROLES.includes(
                role
            )
        ) {
            return res.status(403).json({
                message: 'You do not have permission to delete members.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        if (
            isBranchUser(req) &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch =
                branch;
        }

        const member =
            await Member.findOneAndDelete(
                query
            );

        if (!member) {
            return res.status(404).json({
                message: 'Member not found.',
            });
        }

        return res.status(200).json({
            message: 'Member deleted successfully.',
        });

    } catch (error) {

        console.error(
            'Delete Member Error:',
            error
        );

        return sendServerError(
            res
        );
    }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    addMember,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember,
};