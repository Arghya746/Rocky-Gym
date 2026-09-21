const Member = require('../models/Member');

// ===============================
// GET ACCESSIBLE BRANCH
// ===============================

const getAccessibleBranch = (req) => {

    // Main admin can access both branches
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


// ===============================
// ADD MEMBER
// ===============================

const addMember = async(req, res) => {
    try {

        const {
            name,
            phone,
            email,
            age,
            gender,
            membershipPlan,
            membershipOffer,
            membershipStartDate,
            membershipEndDate,
            amount,
            gymBranch,
        } = req.body;


        // ===============================
        // VALIDATION
        // ===============================

        if (!name ||
            !phone ||
            !membershipPlan ||
            !membershipStartDate ||
            !membershipEndDate ||
            amount === undefined
        ) {
            return res.status(400).json({
                message: 'Required member details are missing.',
            });
        }


        // ===============================
        // DETERMINE BRANCH
        // ===============================

        let selectedBranch;

        if (req.admin && req.admin.role === 'admin') {

            // Main admin can select branch
            selectedBranch =
                gymBranch || 'Kalyanpur';

        } else {

            // Receptionist must use assigned branch
            selectedBranch =
                (req.admin && req.admin.gymBranch) ?
                req.admin.gymBranch :
                'Kalyanpur';
        }

        // ===============================
        // VALIDATE BRANCH
        // ===============================

        const allowedBranches = [
            'Kalyanpur',
            'Gopalpur',
        ];

        if (!allowedBranches.includes(selectedBranch)) {
            return res.status(400).json({
                message: 'Invalid gym branch.',
            });
        }


        // ===============================
        // CREATE MEMBER
        // ===============================

        const member = await Member.create({

            gymBranch: selectedBranch,

            name,

            phone,

            email,

            age,

            gender,

            membershipPlan,

            // Can be null when "No Offer" is selected
            membershipOffer: membershipOffer || null,

            membershipStartDate,

            membershipEndDate,

            amount,

        });


        // ===============================
        // GET MEMBER WITH OFFER
        // ===============================

        const populatedMember =
            await Member.findById(
                member._id
            ).populate(
                'membershipOffer',
                'name offerPrice description benefits'
            );


        res.status(201).json({

            message: 'Member added successfully.',

            member: populatedMember,

        });

    } catch (error) {

        console.error(
            'Add Member Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// GET ALL MEMBERS
// ===============================

const getMembers = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD QUERY
        // ===============================

        const query = branch ? { gymBranch: branch } : {};


        const members =
            await Member.find(query)
            .populate(
                'membershipOffer',
                'name offerPrice description benefits'
            )
            .sort({
                createdAt: -1,
            });


        // ===============================
        // AUTOMATIC EXPIRY CHECK
        // ===============================

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
                            member.status !== 'Expired'
                        ) {

                            member.status =
                                'Expired';

                            await member.save();
                        }


                        return member;

                    }
                )

            );


        res.status(200).json({

            message: 'Members fetched successfully.',

            members: updatedMembers,

        });

    } catch (error) {

        console.error(
            'Get Members Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// GET SINGLE MEMBER
// ===============================

const getMemberById = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD QUERY
        // ===============================

        const query = {
            _id: req.params.id,
        };


        // Receptionist can only access
        // their own branch
        if (branch) {
            query.gymBranch = branch;
        }


        const member =
            await Member.findOne(query)
            .populate(
                'membershipOffer',
                'name offerPrice description benefits'
            );


        if (!member) {

            return res.status(404).json({

                message: 'Member not found.',

            });
        }


        // ===============================
        // AUTOMATIC EXPIRY CHECK
        // ===============================

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


        res.status(200).json({

            member,

        });

    } catch (error) {

        console.error(
            'Get Member Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// UPDATE MEMBER
// ===============================

const updateMember = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // FIND MEMBER
        // ===============================

        const query = {
            _id: req.params.id,
        };


        if (branch) {
            query.gymBranch = branch;
        }


        const existingMember =
            await Member.findOne(query);


        if (!existingMember) {

            return res.status(404).json({

                message: 'Member not found.',

            });
        }


        // ===============================
        // PREVENT RECEPTIONIST
        // FROM CHANGING BRANCH
        // ===============================

        let updateData = {
            ...req.body,
        };


        if (branch) {

            updateData.gymBranch =
                branch;

        } else if (!updateData.gymBranch) {

            // Main admin keeps existing branch
            updateData.gymBranch =
                existingMember.gymBranch;
        }


        // ===============================
        // VALIDATE BRANCH
        // ===============================

        const allowedBranches = [
            'Kalyanpur',
            'Gopalpur',
        ];


        if (!allowedBranches.includes(
                updateData.gymBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        // ===============================
        // UPDATE MEMBER
        // ===============================

        const member =
            await Member.findByIdAndUpdate(

                req.params.id,

                updateData,

                {
                    new: true,
                    runValidators: true,
                }

            ).populate(
                'membershipOffer',
                'name offerPrice description benefits'
            );


        res.status(200).json({

            message: 'Member updated successfully.',

            member,

        });

    } catch (error) {

        console.error(
            'Update Member Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// DELETE MEMBER
// ===============================

const deleteMember = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD QUERY
        // ===============================

        const query = {
            _id: req.params.id,
        };


        if (branch) {
            query.gymBranch = branch;
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


        res.status(200).json({

            message: 'Member deleted successfully.',

        });

    } catch (error) {

        console.error(
            'Delete Member Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// EXPORT CONTROLLERS
// ===============================

module.exports = {

    addMember,

    getMembers,

    getMemberById,

    updateMember,

    deleteMember,

};