const Workout = require('../models/Workout');
const Member = require('../models/Member');


// =========================================
// GET ACCESSIBLE BRANCH
// =========================================

const getAccessibleBranch = (req) => {

    // Main admin can manage both branches
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
            !workoutType
        ) {

            return res.status(400).json({

                message: 'Member, workout name and workout type are required.',

            });
        }


        // =========================================
        // DETERMINE BRANCH
        // =========================================

        let selectedBranch;


        if (
            req.admin &&
            req.admin.role === 'admin'
        ) {

            // Main admin can select branch
            selectedBranch =
                gymBranch || 'Kalyanpur';

        } else {

            // Receptionist uses assigned branch
            selectedBranch =
                (req.admin && req.admin.gymBranch) ?
                req.admin.gymBranch :
                'Kalyanpur';
        }


        // =========================================
        // VALIDATE BRANCH
        // =========================================

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


        // =========================================
        // VERIFY MEMBER
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

                workoutName: workoutName.trim(),

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
                'name phone email'
            );


        res.status(201).json({

            message: 'Workout added successfully.',

            workout: populatedWorkout,

        });

    } catch (error) {

        console.error(
            'Add Workout Error:',
            error.message
        );

        res.status(500).json({

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
        // BUILD QUERY
        // =========================================

        const query = {};


        if (branch) {
            query.gymBranch = branch;
        }


        const workouts =
            await Workout.find(query)

        .populate(
            'member',
            'name phone email'
        )

        .sort({
            createdAt: -1,
        });


        res.status(200).json({

            message: 'Workouts fetched successfully.',

            workouts,

        });

    } catch (error) {

        console.error(
            'Get Workouts Error:',
            error.message
        );

        res.status(500).json({

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
        // BUILD QUERY
        // =========================================

        const query = {

            _id: req.params.id,

        };


        if (branch) {
            query.gymBranch = branch;
        }


        const workout =
            await Workout.findOne(query)

        .populate(
            'member',
            'name phone email'
        );


        if (!workout) {

            return res.status(404).json({

                message: 'Workout not found.',

            });
        }


        res.status(200).json({

            workout,

        });

    } catch (error) {

        console.error(
            'Get Workout Error:',
            error.message
        );

        res.status(500).json({

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
        // FIND WORKOUT
        // =========================================

        const query = {

            _id: req.params.id,

        };


        if (branch) {
            query.gymBranch = branch;
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

            // Receptionist cannot change branch
            finalBranch =
                branch;

        } else {

            // Main admin can change branch
            finalBranch =
                gymBranch ||
                workout.gymBranch ||
                'Kalyanpur';
        }


        // =========================================
        // VALIDATE BRANCH
        // =========================================

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


        // =========================================
        // VERIFY MEMBER IF CHANGED
        // =========================================

        if (member !== undefined) {

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

            workout.workoutName =
                workoutName.trim();
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
                'name phone email'
            );


        res.status(200).json({

            message: 'Workout updated successfully.',

            workout: updatedWorkout,

        });

    } catch (error) {

        console.error(
            'Update Workout Error:',
            error.message
        );

        res.status(500).json({

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
        // BUILD QUERY
        // =========================================

        const query = {

            _id: req.params.id,

        };


        if (branch) {
            query.gymBranch = branch;
        }


        const workout =
            await Workout.findOneAndDelete(
                query
            );


        if (!workout) {

            return res.status(404).json({

                message: 'Workout not found.',

            });
        }


        res.status(200).json({

            message: 'Workout deleted successfully.',

        });

    } catch (error) {

        console.error(
            'Delete Workout Error:',
            error.message
        );

        res.status(500).json({

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