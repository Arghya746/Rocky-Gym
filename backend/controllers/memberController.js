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
            membershipStartDate,
            membershipEndDate,
            amount,
        } = req.body;

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

        const member = await Member.create({
            name,
            phone,
            email,
            age,
            gender,
            membershipPlan,
            membershipStartDate,
            membershipEndDate,
            amount,
        });

        res.status(201).json({
            message: 'Member added successfully.',
            member,
        });

    } catch (error) {
        console.error('Add Member Error:', error.message);

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
        const members = await Member.find()
            .sort({ createdAt: -1 });

        const today = new Date();

        const updatedMembers = await Promise.all(
            members.map(async(member) => {

                if (
                    member.membershipEndDate &&
                    new Date(member.membershipEndDate) < today &&
                    member.status !== 'Expired'
                ) {
                    member.status = 'Expired';

                    await member.save();
                }

                return member;
            })
        );

        res.status(200).json({
            message: 'Members fetched successfully.',
            members: updatedMembers,
        });

    } catch (error) {
        console.error('Get Members Error:', error.message);

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
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                message: 'Member not found.',
            });
        }

        // Automatically mark expired membership
        const today = new Date();

        if (
            member.membershipEndDate &&
            new Date(member.membershipEndDate) < today &&
            member.status !== 'Expired'
        ) {
            member.status = 'Expired';

            await member.save();
        }

        res.status(200).json({
            member,
        });

    } catch (error) {
        console.error('Get Member Error:', error.message);

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
        const member = await Member.findByIdAndUpdate(
            req.params.id,
            req.body, {
                new: true,
                runValidators: true,
            }
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
        console.error('Update Member Error:', error.message);

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
        const member = await Member.findByIdAndDelete(req.params.id);

        if (!member) {
            return res.status(404).json({
                message: 'Member not found.',
            });
        }

        res.status(200).json({
            message: 'Member deleted successfully.',
        });

    } catch (error) {
        console.error('Delete Member Error:', error.message);

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