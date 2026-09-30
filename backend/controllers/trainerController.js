const Trainer = require('../models/Trainer');

const {
    normalizeBranch,
    getAccessibleBranches,
    getRequestedBranch,
    getBranchFilter,
    resolveWriteBranch,
    isMainAdminRequest,
} = require('../utils/branchAccess');

// ============================================================
// AUTH HELPER
// ============================================================

const ensureAdmin = (req, res) => {
    if (!req.admin) {
        res.status(401).json({
            message: 'Not authorized.',
        });

        return false;
    }

    return true;
};

// ============================================================
// CREATE TRAINER
// ============================================================

const createTrainer = async(req, res) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
        }

        const {
            name,
            phone,
            email,
            specialization,
            experience,
            gender,
            photo,
            bio,
            status,
            gymBranch,
        } = req.body;

        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!name ||
            !String(name).trim() ||
            !phone ||
            !String(phone).trim() ||
            !specialization ||
            !String(specialization).trim()
        ) {
            return res.status(400).json({
                message: 'Name, phone and specialization are required.',
            });
        }

        // ----------------------------------------------------
        // BRANCH
        // ----------------------------------------------------

        const branchResult = resolveWriteBranch(
            req,
            gymBranch
        );

        if (branchResult.error) {
            return res.status(
                branchResult.status || 400
            ).json({
                message: branchResult.error,
            });
        }

        const selectedBranch = normalizeBranch(
            branchResult.branch
        );

        if (!selectedBranch) {
            return res.status(400).json({
                message: 'Invalid gym branch.',
            });
        }

        // ----------------------------------------------------
        // CREATE
        // ----------------------------------------------------

        const trainer = await Trainer.create({
            gymBranch: selectedBranch,

            name: String(name).trim(),

            phone: String(phone).trim(),

            email: email ?
                String(email).trim().toLowerCase() :
                '',

            specialization: String(specialization).trim(),

            experience: experience !== undefined &&
                experience !== null &&
                experience !== '' ?
                Number(experience) :
                0,

            gender: gender || '',

            photo: photo || '',

            bio: bio ?
                String(bio).trim() :
                '',

            status: status || 'Active',
        });

        return res.status(201).json({
            message: 'Trainer created successfully.',
            trainer,
        });
    } catch (error) {
        console.error(
            'Create Trainer Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ============================================================
// GET TRAINERS
// ============================================================

const getTrainers = async(req, res) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
        }

        let query;

        try {
            query = getBranchFilter(req);
        } catch (branchError) {
            return res.status(
                branchError.status || 403
            ).json({
                message: branchError.message ||
                    'You do not have access to the selected gym branch.',
            });
        }

        const trainers = await Trainer.find(query)
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            message: 'Trainers fetched successfully.',
            trainers,
        });
    } catch (error) {
        console.error(
            'Get Trainers Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ============================================================
// GET TRAINER BY ID
// ============================================================

const getTrainerById = async(req, res) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
        }

        let branchFilter;

        try {
            branchFilter =
                getBranchFilter(req);
        } catch (branchError) {
            return res.status(
                branchError.status || 403
            ).json({
                message: branchError.message ||
                    'You do not have access to the selected gym branch.',
            });
        }

        const trainer =
            await Trainer.findOne({
                ...branchFilter,
                _id: req.params.id,
            });

        if (!trainer) {
            return res.status(404).json({
                message: 'Trainer not found.',
            });
        }

        return res.status(200).json({
            trainer,
        });
    } catch (error) {
        console.error(
            'Get Trainer Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ============================================================
// UPDATE TRAINER
// ============================================================

const updateTrainer = async(req, res) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
        }

        let currentFilter;

        try {
            currentFilter =
                getBranchFilter(req);
        } catch (branchError) {
            return res.status(
                branchError.status || 403
            ).json({
                message: branchError.message ||
                    'You do not have access to the selected gym branch.',
            });
        }

        // ----------------------------------------------------
        // FIND EXISTING TRAINER
        // ----------------------------------------------------

        const trainer =
            await Trainer.findOne({
                ...currentFilter,
                _id: req.params.id,
            });

        if (!trainer) {
            return res.status(404).json({
                message: 'Trainer not found.',
            });
        }

        const {
            name,
            phone,
            email,
            specialization,
            experience,
            gender,
            photo,
            bio,
            status,
            gymBranch,
        } = req.body;

        // ----------------------------------------------------
        // BRANCH UPDATE
        // ----------------------------------------------------

        let finalBranch =
            normalizeBranch(
                trainer.gymBranch
            );

        if (isMainAdminRequest(req)) {
            /*
             * Main admins can move a trainer
             * between Kalyanpur and Gopalpur.
             */

            if (gymBranch !== undefined) {
                const normalized =
                    normalizeBranch(
                        gymBranch
                    );

                if (!normalized) {
                    return res.status(400).json({
                        message: 'Invalid gym branch.',
                    });
                }

                finalBranch = normalized;
            }
        } else {
            /*
             * Receptionists/staff cannot move
             * trainers to another branch.
             */

            const accessibleBranches =
                getAccessibleBranches(req);

            if (!accessibleBranches.includes(
                    finalBranch
                )) {
                return res.status(403).json({
                    message: 'You do not have access to this trainer.',
                });
            }

            if (
                gymBranch !== undefined &&
                normalizeBranch(gymBranch) !==
                finalBranch
            ) {
                return res.status(403).json({
                    message: 'You cannot move a trainer to another gym branch.',
                });
            }
        }

        // ----------------------------------------------------
        // NAME
        // ----------------------------------------------------

        if (name !== undefined) {
            const value =
                String(name).trim();

            if (!value) {
                return res.status(400).json({
                    message: 'Trainer name cannot be empty.',
                });
            }

            trainer.name = value;
        }

        // ----------------------------------------------------
        // PHONE
        // ----------------------------------------------------

        if (phone !== undefined) {
            const value =
                String(phone).trim();

            if (!value) {
                return res.status(400).json({
                    message: 'Trainer phone cannot be empty.',
                });
            }

            trainer.phone = value;
        }

        // ----------------------------------------------------
        // EMAIL
        // ----------------------------------------------------

        if (email !== undefined) {
            trainer.email = email ?
                String(email)
                .trim()
                .toLowerCase() :
                '';
        }

        // ----------------------------------------------------
        // SPECIALIZATION
        // ----------------------------------------------------

        if (
            specialization !== undefined
        ) {
            const value =
                String(
                    specialization
                ).trim();

            if (!value) {
                return res.status(400).json({
                    message: 'Trainer specialization cannot be empty.',
                });
            }

            trainer.specialization =
                value;
        }

        // ----------------------------------------------------
        // EXPERIENCE
        // ----------------------------------------------------

        if (experience !== undefined) {
            trainer.experience =
                experience === '' ||
                experience === null ?
                0 :
                Number(experience);
        }

        // ----------------------------------------------------
        // OTHER FIELDS
        // ----------------------------------------------------

        if (gender !== undefined) {
            trainer.gender = gender;
        }

        if (photo !== undefined) {
            trainer.photo = photo;
        }

        if (bio !== undefined) {
            trainer.bio = bio ?
                String(bio).trim() :
                '';
        }

        if (status !== undefined) {
            trainer.status = status;
        }

        // ----------------------------------------------------
        // FINAL BRANCH
        // ----------------------------------------------------

        trainer.gymBranch =
            finalBranch;

        await trainer.save();

        return res.status(200).json({
            message: 'Trainer updated successfully.',
            trainer,
        });
    } catch (error) {
        console.error(
            'Update Trainer Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ============================================================
// DELETE TRAINER
// ============================================================

const deleteTrainer = async(req, res) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
        }

        let branchFilter;

        try {
            branchFilter =
                getBranchFilter(req);
        } catch (branchError) {
            return res.status(
                branchError.status || 403
            ).json({
                message: branchError.message ||
                    'You do not have access to the selected gym branch.',
            });
        }

        const trainer =
            await Trainer.findOneAndDelete({
                ...branchFilter,
                _id: req.params.id,
            });

        if (!trainer) {
            return res.status(404).json({
                message: 'Trainer not found.',
            });
        }

        return res.status(200).json({
            message: 'Trainer deleted successfully.',
        });
    } catch (error) {
        console.error(
            'Delete Trainer Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    createTrainer,
    getTrainers,
    getTrainerById,
    updateTrainer,
    deleteTrainer,
};