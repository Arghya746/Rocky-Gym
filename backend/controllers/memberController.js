const Member = require('../models/Member');


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
        // CREATE MEMBER
        // ===============================

        const member = await Member.create({

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


        // Get member with offer information
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

        const members =
            await Member.find()
            .populate(
                'membershipOffer',
                'name offerPrice description benefits'
            )
            .sort({
                createdAt: -1,
            });


        const today = new Date();


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

        const member =
            await Member.findById(
                req.params.id
            ).populate(
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

        const member =
            await Member.findByIdAndUpdate(

                req.params.id,

                req.body,

                {
                    new: true,
                    runValidators: true,
                }

            ).populate(
                'membershipOffer',
                'name offerPrice description benefits'
            );


        if (!member) {

            return res.status(404).json({

                message: 'Member not found.',

            });
        }


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

        const member =
            await Member.findByIdAndDelete(
                req.params.id
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