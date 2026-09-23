const Workout = require('../models/Workout');
const Member = require('../models/Member');


// =========================================
// ALLOWED BRANCHES
// =========================================

const ALLOWED_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];


// =========================================
// NORMALIZE BRANCH
// =========================================

const normalizeBranch = (value) => {

    if (!value) {
        return null;
    }

    const normalized =
        String(value)
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


// =========================================
// GET ACCESSIBLE BRANCH
// =========================================
// Main admin:
//   null = access to both branches
//
// Receptionist:
//   assigned branch only
// =========================================

const getAccessibleBranch = (req) => {

    // Main admin can manage both branches
    if (
        req.admin &&
        req.admin.role === 'admin'
    ) {
        return null;
    }

    // Receptionist can access only
    // their assigned branch
    if (
        req.admin &&
        req.admin.role === 'receptionist'
    ) {

        return normalizeBranch(
            req.admin.gymBranch
        );
    }

    return null;
};


// =========================================
// GET WRITE BRANCH
// =========================================
// Main admin:
//   Must provide a valid branch.
//
// Receptionist:
//   Always uses assigned branch.
//   Cannot override it.
// =========================================

const getWriteBranch = (req, requestedBranch) => {

    // =========================================
    // MAIN ADMIN
    // =========================================

    if (
        req.admin &&
        req.admin.role === 'admin'
    ) {

        return normalizeBranch(
            requestedBranch
        );
    }


    // =========================================
    // RECEPTIONIST
    // =========================================

    if (
        req.admin &&
        req.admin.role === 'receptionist'
    ) {

        return normalizeBranch(
            req.admin.gymBranch
        );
    }


    return null;
};


// =========================================
// ADD WORKOUT
// =========================================

const addWorkout = async(req, res) => {

    try {

        const {
            member,
            workoutName,
            workoutType,
            exercises,
            startDate,
            endDate,
            status,
            notes,
            gymBranch,
        } = req.body;


        // =========================================
        // VALIDATION
        // =========================================

        if (!member ||
            !workoutName ||
            !String(workoutName).trim() ||
            !workoutType
        ) {

            return res.status(400).json({

                message: 'Member, workout name and workout type are required.',

            });
        }


        // =========================================
        // DETERMINE BRANCH
        // =========================================

        const selectedBranch =
            getWriteBranch(
                req,
                gymBranch
            );


        // =========================================
        // VALIDATE BRANCH
        // =========================================

        if (!selectedBranch) {

            if (
                req.admin &&
                req.admin.role === 'receptionist'
            ) {

                return res.status(403).json({

                    message: 'Your account is not assigned to a valid gym branch.',

                });
            }

            return res.status(400).json({

                message: 'A valid gym branch is required.',

            });
        }


        if (!ALLOWED_BRANCHES.includes(
                selectedBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        // =========================================
        // VERIFY MEMBER BELONGS TO SAME BRANCH
        // =========================================

        const existingMember =
            await Member.findOne({

                _id: member,

                gymBranch: selectedBranch,

            });


        if (!existingMember) {

            return res.status(404).json({

                message: 'Member not found in the selected gym branch.',

            });
        }


        // =========================================
        // CREATE WORKOUT
        // =========================================

        const workout =
            await Workout.create({

                gymBranch: selectedBranch,

                member,

                workoutName: String(workoutName).trim(),

                workoutType,

                exercises: Array.isArray(exercises) ?
                    exercises :
                    [],

                startDate,

                endDate,

                status,

                notes,

            });


        // =========================================
        // POPULATE MEMBER
        // =========================================

        const populatedWorkout =
            await Workout.findById(
                workout._id
            ).populate(
                'member',
                'name phone email gymBranch'
            );


        return res.status(201).json({

            message: 'Workout added successfully.',

            workout: populatedWorkout,

        });

    } catch (error) {

        console.error(
            'Add Workout Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// GET ALL WORKOUTS
// =========================================

const getWorkouts = async(req, res) => {

    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // VALIDATE RECEPTIONIST BRANCH
        // =========================================

        if (
            req.admin &&
            req.admin.role === 'receptionist' &&
            !branch
        ) {

            return res.status(403).json({

                message: 'Your account is not assigned to a valid gym branch.',

            });
        }


        // =========================================
        // BUILD QUERY
        // =========================================

        const query =
            branch ?
            {
                gymBranch: branch,
            } :
            {};


        // =========================================
        // FETCH WORKOUTS
        // =========================================

        const workouts =
            await Workout.find(query)
            .populate(
                'member',
                'name phone email gymBranch'
            )
            .sort({
                createdAt: -1,
            });


        return res.status(200).json({

            message: 'Workouts fetched successfully.',

            workouts,

        });

    } catch (error) {

        console.error(
            'Get Workouts Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// GET WORKOUT BY ID
// =========================================

const getWorkoutById = async(req, res) => {

    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // VALIDATE RECEPTIONIST BRANCH
        // =========================================

        if (
            req.admin &&
            req.admin.role === 'receptionist' &&
            !branch
        ) {

            return res.status(403).json({

                message: 'Your account is not assigned to a valid gym branch.',

            });
        }


        // =========================================
        // BUILD QUERY
        // =========================================

        const query = {

            _id: req.params.id,

        };


        // Receptionist:
        // assigned branch only.
        if (branch) {

            query.gymBranch =
                branch;
        }


        // =========================================
        // FIND WORKOUT
        // =========================================

        const workout =
            await Workout.findOne(query)
            .populate(
                'member',
                'name phone email gymBranch'
            );


        if (!workout) {

            return res.status(404).json({

                message: 'Workout not found.',

            });
        }


        return res.status(200).json({

            workout,

        });

    } catch (error) {

        console.error(
            'Get Workout Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// UPDATE WORKOUT
// =========================================

const updateWorkout = async(req, res) => {

    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // VALIDATE RECEPTIONIST BRANCH
        // =========================================

        if (
            req.admin &&
            req.admin.role === 'receptionist' &&
            !branch
        ) {

            return res.status(403).json({

                message: 'Your account is not assigned to a valid gym branch.',

            });
        }


        // =========================================
        // FIND WORKOUT
        // =========================================

        const query = {

            _id: req.params.id,

        };


        if (branch) {

            query.gymBranch =
                branch;
        }


        const workout =
            await Workout.findOne(query);


        if (!workout) {

            return res.status(404).json({

                message: 'Workout not found.',

            });
        }


        const {
            member,
            workoutName,
            workoutType,
            exercises,
            startDate,
            endDate,
            status,
            notes,
            gymBranch,
        } = req.body;


        // =========================================
        // DETERMINE FINAL BRANCH
        // =========================================

        let finalBranch;


        if (branch) {

            // Receptionist cannot change branch.
            finalBranch =
                branch;

        } else {

            // Main admin can keep the existing
            // branch or explicitly change it.
            finalBranch =
                normalizeBranch(
                    gymBranch ||
                    workout.gymBranch
                );


            if (!finalBranch) {

                return res.status(400).json({

                    message: 'A valid gym branch is required.',

                });
            }
        }


        // =========================================
        // VALIDATE BRANCH
        // =========================================

        if (!ALLOWED_BRANCHES.includes(
                finalBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        // =========================================
        // VERIFY MEMBER IF CHANGED
        // =========================================

        if (member !== undefined) {

            if (!member) {

                return res.status(400).json({

                    message: 'Member is required.',

                });
            }


            const existingMember =
                await Member.findOne({

                    _id: member,

                    gymBranch: finalBranch,

                });


            if (!existingMember) {

                return res.status(404).json({

                    message: 'Member not found in the selected gym branch.',

                });
            }


            workout.member =
                member;
        }


        // =========================================
        // UPDATE WORKOUT NAME
        // =========================================

        if (
            workoutName !== undefined
        ) {

            if (!String(workoutName).trim()) {

                return res.status(400).json({

                    message: 'Workout name cannot be empty.',

                });
            }

            workout.workoutName =
                String(workoutName).trim();
        }


        // =========================================
        // UPDATE WORKOUT TYPE
        // =========================================

        if (
            workoutType !== undefined
        ) {

            workout.workoutType =
                workoutType;
        }


        // =========================================
        // UPDATE EXERCISES
        // =========================================

        if (
            exercises !== undefined
        ) {

            workout.exercises =
                Array.isArray(exercises) ?
                exercises :
                [];
        }


        // =========================================
        // UPDATE DATES
        // =========================================

        if (
            startDate !== undefined
        ) {

            workout.startDate =
                startDate;
        }


        if (
            endDate !== undefined
        ) {

            workout.endDate =
                endDate;
        }


        // =========================================
        // UPDATE STATUS
        // =========================================

        if (
            status !== undefined
        ) {

            workout.status =
                status;
        }


        // =========================================
        // UPDATE NOTES
        // =========================================

        if (
            notes !== undefined
        ) {

            workout.notes =
                notes;
        }


        // =========================================
        // UPDATE BRANCH
        // =========================================

        workout.gymBranch =
            finalBranch;


        // =========================================
        // SAVE
        // =========================================

        await workout.save();


        // =========================================
        // POPULATE UPDATED WORKOUT
        // =========================================

        const updatedWorkout =
            await Workout.findById(
                workout._id
            ).populate(
                'member',
                'name phone email gymBranch'
            );


        return res.status(200).json({

            message: 'Workout updated successfully.',

            workout: updatedWorkout,

        });

    } catch (error) {

        console.error(
            'Update Workout Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// DELETE WORKOUT
// =========================================

const deleteWorkout = async(req, res) => {

    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // VALIDATE RECEPTIONIST BRANCH
        // =========================================

        if (
            req.admin &&
            req.admin.role === 'receptionist' &&
            !branch
        ) {

            return res.status(403).json({

                message: 'Your account is not assigned to a valid gym branch.',

            });
        }


        // =========================================
        // BUILD QUERY
        // =========================================

        const query = {

            _id: req.params.id,

        };


        // Receptionist can delete only
        // workouts belonging to assigned branch.
        if (branch) {

            query.gymBranch =
                branch;
        }


        // =========================================
        // DELETE WORKOUT
        // =========================================

        const workout =
            await Workout.findOneAndDelete(
                query
            );


        if (!workout) {

            return res.status(404).json({

                message: 'Workout not found.',

            });
        }


        return res.status(200).json({

            message: 'Workout deleted successfully.',

        });

    } catch (error) {

        console.error(
            'Delete Workout Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// EXPORT CONTROLLERS
// =========================================

module.exports = {

    addWorkout,

    getWorkouts,

    getWorkoutById,

    updateWorkout,

    deleteWorkout,

};