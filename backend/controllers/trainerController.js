const Trainer = require('../models/Trainer');


// =====================================
// GET ACCESSIBLE BRANCH
// =====================================

const getAccessibleBranch = (req) => {
    // Main admin can access both branches
    if (
        req.admin &&
        req.admin.role === 'admin'
    ) {
        return null;
    }

    // Receptionist can access assigned branch
    if (
        req.admin &&
        req.admin.gymBranch
    ) {
        return req.admin.gymBranch;
    }

    // Fallback for old accounts
    return 'Kalyanpur';
};


// =====================================
// CREATE TRAINER
// =====================================

const createTrainer = async(req, res) => {
    try {
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

        if (!name ||
            !phone ||
            !specialization
        ) {
            return res.status(400).json({
                message: 'Name, phone and specialization are required.',
            });
        }

        let selectedBranch;

        // Main admin can choose branch
        if (
            req.admin &&
            req.admin.role === 'admin'
        ) {
            selectedBranch =
                gymBranch || 'Kalyanpur';
        } else {
            // Receptionist is restricted
            // to assigned branch
            selectedBranch =
                (
                    req.admin &&
                    req.admin.gymBranch
                ) ?
                req.admin.gymBranch :
                'Kalyanpur';
        }

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

        const trainer =
            await Trainer.create({
                gymBranch: selectedBranch,
                name: name.trim(),
                phone: phone.trim(),
                email: email ?
                    email.trim().toLowerCase() :
                    '',
                specialization: specialization.trim(),
                experience: experience !== undefined ?
                    experience :
                    0,
                gender,
                photo: photo || '',
                bio: bio ?
                    bio.trim() :
                    '',
                status: status || 'Active',
            });

        res.status(201).json({
            message: 'Trainer created successfully.',
            trainer,
        });

    } catch (error) {
        console.error(
            'Create Trainer Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =====================================
// GET ALL TRAINERS
// =====================================

const getTrainers = async(req, res) => {
    try {
        const branch =
            getAccessibleBranch(req);

        const query = {};

        if (branch) {
            query.gymBranch = branch;
        }

        const trainers =
            await Trainer.find(query)
            .sort({
                createdAt: -1,
            });

        res.status(200).json({
            message: 'Trainers fetched successfully.',
            trainers,
        });

    } catch (error) {
        console.error(
            'Get Trainers Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =====================================
// GET SINGLE TRAINER
// =====================================

const getTrainerById = async(req, res) => {
    try {
        const branch =
            getAccessibleBranch(req);

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch = branch;
        }

        const trainer =
            await Trainer.findOne(query);

        if (!trainer) {
            return res.status(404).json({
                message: 'Trainer not found.',
            });
        }

        res.status(200).json({
            trainer,
        });

    } catch (error) {
        console.error(
            'Get Trainer Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =====================================
// UPDATE TRAINER
// =====================================

const updateTrainer = async(req, res) => {
    try {
        const branch =
            getAccessibleBranch(req);

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch = branch;
        }

        const trainer =
            await Trainer.findOne(query);

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

        let finalBranch;

        // Receptionist cannot change branch
        if (branch) {
            finalBranch = branch;
        } else {
            finalBranch =
                gymBranch ||
                trainer.gymBranch ||
                'Kalyanpur';
        }

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

        if (name !== undefined) {
            trainer.name =
                name.trim();
        }

        if (phone !== undefined) {
            trainer.phone =
                phone.trim();
        }

        if (email !== undefined) {
            trainer.email =
                email ?
                email.trim().toLowerCase() :
                '';
        }

        if (
            specialization !== undefined
        ) {
            trainer.specialization =
                specialization.trim();
        }

        if (experience !== undefined) {
            trainer.experience =
                experience;
        }

        if (gender !== undefined) {
            trainer.gender =
                gender;
        }

        if (photo !== undefined) {
            trainer.photo =
                photo;
        }

        if (bio !== undefined) {
            trainer.bio =
                bio ?
                bio.trim() :
                '';
        }

        if (status !== undefined) {
            trainer.status =
                status;
        }

        trainer.gymBranch =
            finalBranch;

        await trainer.save();

        res.status(200).json({
            message: 'Trainer updated successfully.',
            trainer,
        });

    } catch (error) {
        console.error(
            'Update Trainer Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// =====================================
// DELETE TRAINER
// =====================================

const deleteTrainer = async(req, res) => {
    try {
        const branch =
            getAccessibleBranch(req);

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch = branch;
        }

        const trainer =
            await Trainer.findOneAndDelete(
                query
            );

        if (!trainer) {
            return res.status(404).json({
                message: 'Trainer not found.',
            });
        }

        res.status(200).json({
            message: 'Trainer deleted successfully.',
        });

    } catch (error) {
        console.error(
            'Delete Trainer Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


module.exports = {
    createTrainer,
    getTrainers,
    getTrainerById,
    updateTrainer,
    deleteTrainer,
};