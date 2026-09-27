const Member = require('../models/Member');

const ALLOWED_BRANCHES = ['Kalyanpur', 'Gopalpur'];

// ===============================
// NORMALIZE BRANCH
// ===============================

const normalizeBranch = (value) => {
    if (!value) return null;

    const normalized = String(value)
        .trim()
        .toLowerCase();

    if (normalized === 'kalyanpur') {
        return 'Kalyanpur';
    }

    if (normalized === 'gopalpur') {
        return 'Gopalpur';
    }

    return null;
};

// ===============================
// GET ACCESSIBLE BRANCH
// ===============================

const getAccessibleBranch = (req) => {
    if (!req.admin) {
        return null;
    }

    const role = String(req.admin.role || '').toLowerCase();

    // Main admins can access both branches.
    if (
        role === 'admin' ||
        role === 'main_admin' ||
        role === 'super_admin'
    ) {
        return null;
    }

    // Receptionist/staff can access only
    // their assigned branch.
    if (
        role === 'receptionist' ||
        role === 'staff'
    ) {
        const branch = normalizeBranch(
            req.admin.gymBranch
        );

        if (!branch) {
            return null;
        }

        return branch;
    }

    return null;
};

// ===============================
// GET WRITE BRANCH
// ===============================

const getWriteBranch = (req, requestedBranch) => {
    if (!req.admin) {
        return {
            error: 'Not authorized.',
            status: 401,
        };
    }

    const role = String(req.admin.role || '').toLowerCase();

    // ===============================
    // MAIN ADMIN
    // ===============================

    if (
        role === 'admin' ||
        role === 'main_admin' ||
        role === 'super_admin'
    ) {
        const branch = normalizeBranch(
            requestedBranch
        );

        if (!branch) {
            return {
                error: 'Select Kalyanpur or Gopalpur before creating a member.',
                status: 400,
            };
        }

        return {
            branch,
        };
    }

    // ===============================
    // RECEPTIONIST / STAFF
    // ===============================

    if (
        role === 'receptionist' ||
        role === 'staff'
    ) {
        const branch = normalizeBranch(
            req.admin.gymBranch
        );

        if (!branch) {
            return {
                error: 'Your account is not assigned to a valid gym branch.',
                status: 403,
            };
        }

        return {
            branch,
        };
    }

    return {
        error: 'You do not have permission to manage members.',
        status: 403,
    };
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

        const branchResult = getWriteBranch(
            req,
            gymBranch
        );

        if (branchResult.error) {
            return res
                .status(branchResult.status)
                .json({
                    message: branchResult.error,
                });
        }

        const selectedBranch =
            branchResult.branch;

        // ===============================
        // VALIDATE BRANCH
        // ===============================

        if (!ALLOWED_BRANCHES.includes(
                selectedBranch
            )) {
            return res.status(400).json({
                message: 'Invalid gym branch.',
            });
        }

        // ===============================
        // CREATE MEMBER
        // ===============================

        const member = await Member.create({
            gymBranch: selectedBranch,

            name: String(name).trim(),

            phone: String(phone).trim(),

            email: email ?
                String(email).trim() :
                '',

            age,

            gender,

            membershipPlan,

            membershipOffer: membershipOffer || null,

            membershipStartDate,

            membershipEndDate,

            amount,
        });

        // ===============================
        // POPULATE OFFER
        // ===============================

        const populatedMember =
            await Member.findById(
                member._id
            ).populate(
                'membershipOffer',
                'name offerPrice description benefits'
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

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// GET ALL MEMBERS
// ===============================

const getMembers = async(req, res) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const role = String(
            req.admin.role || ''
        ).toLowerCase();

        const branch =
            getAccessibleBranch(req);

        // Receptionist/staff without a valid
        // branch must not receive any data.
        if (
            (
                role === 'receptionist' ||
                role === 'staff'
            ) &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        const query = branch ?
            {
                gymBranch: branch,
            } :
            {};

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

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// GET SINGLE MEMBER
// ===============================

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

        const role = String(
            req.admin.role || ''
        ).toLowerCase();

        const branch =
            getAccessibleBranch(req);

        if (
            (
                role === 'receptionist' ||
                role === 'staff'
            ) &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        const query = {
            _id: req.params.id,
        };

        // Branch users can only access
        // members from their branch.
        if (branch) {
            query.gymBranch = branch;
        }

        const member =
            await Member.findOne(
                query
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

        const today = new Date();

        if (
            member.membershipEndDate &&
            new Date(
                member.membershipEndDate
            ) < today &&
            member.status !== 'Expired'
        ) {
            member.status = 'Expired';

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

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// UPDATE MEMBER
// ===============================

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

        const role = String(
            req.admin.role || ''
        ).toLowerCase();

        const branch =
            getAccessibleBranch(req);

        // Receptionist/staff must have
        // a valid assigned branch.
        if (
            (
                role === 'receptionist' ||
                role === 'staff'
            ) &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

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

        // Copy request data.
        const updateData = {
            ...req.body,
        };

        // ===============================
        // BRANCH PROTECTION
        // ===============================

        if (
            role === 'receptionist' ||
            role === 'staff'
        ) {
            // Never trust branch supplied
            // by receptionist/staff.
            updateData.gymBranch =
                branch;
        } else if (
            role === 'admin' ||
            role === 'main_admin' ||
            role === 'super_admin'
        ) {
            // Main admin can change branch,
            // but only to a valid branch.

            const requestedBranch =
                normalizeBranch(
                    updateData.gymBranch
                );

            if (
                updateData.gymBranch !==
                undefined &&
                !requestedBranch
            ) {
                return res.status(400).json({
                    message: 'Invalid gym branch.',
                });
            }

            updateData.gymBranch =
                requestedBranch ||
                normalizeBranch(
                    existingMember.gymBranch
                );

            if (!updateData.gymBranch) {
                return res.status(400).json({
                    message: 'Member has no valid gym branch.',
                });
            }
        } else {
            return res.status(403).json({
                message: 'You do not have permission to update members.',
            });
        }

        // ===============================
        // VALIDATE FINAL BRANCH
        // ===============================

        if (!ALLOWED_BRANCHES.includes(
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
                updateData, {
                    new: true,
                    runValidators: true,
                }
            ).populate(
                'membershipOffer',
                'name offerPrice description benefits'
            );

        return res.status(200).json({
            message: 'Member updated successfully.',

            member,
        });
    } catch (error) {
        console.error(
            'Update Member Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// DELETE MEMBER
// ===============================

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

        const role = String(
            req.admin.role || ''
        ).toLowerCase();

        const branch =
            getAccessibleBranch(req);

        // Receptionist/staff must have
        // a valid assigned branch.
        if (
            (
                role === 'receptionist' ||
                role === 'staff'
            ) &&
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

        return res.status(200).json({
            message: 'Member deleted successfully.',
        });
    } catch (error) {
        console.error(
            'Delete Member Error:',
            error
        );

        return res.status(500).json({
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