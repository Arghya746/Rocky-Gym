const mongoose = require('mongoose');

const Workout = require('../models/Workout');
const Member = require('../models/Member');

const {
    VALID_BRANCHES,
    normalizeBranch,
    isMainAdminRequest,
    getAccessibleBranches,
    getBranchFilter,
    resolveWriteBranch,
} = require('../utils/branchAccess');

// ============================================================
// CONSTANTS
// ============================================================

const VALID_WORKOUT_TYPES = [
    'Strength',
    'Cardio',
    'Weight Loss',
    'Muscle Building',
    'Flexibility',
    'General Fitness',
];

const VALID_STATUSES = [
    'Active',
    'Completed',
];

// ============================================================
// AUTH HELPER
// ============================================================

const ensureAdmin = (
    req,
    res
) => {
    if (!req || !req.admin) {
        res.status(401).json({
            message: 'Not authorized.',
        });

        return false;
    }

    return true;
};

// ============================================================
// OBJECT ID HELPER
// ============================================================

const isValidObjectId = (
    value
) => {
    return mongoose.Types.ObjectId.isValid(
        String(value || '')
    );
};

// ============================================================
// WORKOUT TYPE
// ============================================================

const normalizeWorkoutType = (
    value
) => {
    if (
        value === undefined ||
        value === null
    ) {
        return '';
    }

    return String(value).trim();
};

// ============================================================
// STATUS
// ============================================================

const normalizeStatus = (
    value
) => {
    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {
        return undefined;
    }

    return String(value).trim();
};

// ============================================================
// EXERCISES
// ============================================================

const normalizeExercises = (
    exercises
) => {
    if (exercises === undefined) {
        return [];
    }

    if (!Array.isArray(exercises)) {
        return null;
    }

    return exercises;
};

// ============================================================
// SERVER ERROR
// ============================================================

const sendServerError = (
    res,
    label,
    error
) => {
    console.error(
        `\n[${label}]`
    );

    console.error(
        error &&
        error.stack ?
        error.stack :
        error
    );

    return res.status(500).json({
        message: 'Server error. Please try again.',
    });
};

// ============================================================
// GET MEMBER IN BRANCH
// ============================================================

const findMemberInBranch = async(
    memberId,
    gymBranch
) => {
    if (!isValidObjectId(memberId)) {
        return null;
    }

    return Member.findOne({
        _id: memberId,
        gymBranch,
    });
};

// ============================================================
// ADD WORKOUT
// ============================================================

const addWorkout = async(
    req,
    res
) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
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
        } = req.body || {};

        // ----------------------------------------------------
        // MEMBER
        // ----------------------------------------------------

        if (!member) {
            return res.status(400).json({
                message: 'Member is required.',
            });
        }

        if (!isValidObjectId(member)) {
            return res.status(400).json({
                message: 'Invalid member ID.',
            });
        }

        // ----------------------------------------------------
        // WORKOUT NAME
        // ----------------------------------------------------

        const finalWorkoutName =
            String(
                workoutName || ''
            ).trim();

        if (!finalWorkoutName) {
            return res.status(400).json({
                message: 'Workout name is required.',
            });
        }

        // ----------------------------------------------------
        // WORKOUT TYPE
        // ----------------------------------------------------

        const finalWorkoutType =
            normalizeWorkoutType(
                workoutType
            );

        if (!finalWorkoutType) {
            return res.status(400).json({
                message: 'Workout type is required.',
            });
        }

        if (!VALID_WORKOUT_TYPES.includes(
                finalWorkoutType
            )) {
            return res.status(400).json({
                message: 'Invalid workout type.',
            });
        }

        // ----------------------------------------------------
        // STATUS
        // ----------------------------------------------------

        const finalStatus =
            normalizeStatus(status);

        if (
            finalStatus &&
            !VALID_STATUSES.includes(
                finalStatus
            )
        ) {
            return res.status(400).json({
                message: 'Invalid workout status.',
            });
        }

        // ----------------------------------------------------
        // EXERCISES
        // ----------------------------------------------------

        const finalExercises =
            normalizeExercises(
                exercises
            );

        if (finalExercises === null) {
            return res.status(400).json({
                message: 'Exercises must be an array.',
            });
        }

        // ----------------------------------------------------
        // BRANCH
        // ----------------------------------------------------

        const branchResult =
            resolveWriteBranch(
                req,
                gymBranch
            );

        if (branchResult.error) {
            return res
                .status(
                    branchResult.status || 400
                )
                .json({
                    message: branchResult.error,
                });
        }

        const selectedBranch =
            normalizeBranch(
                branchResult.branch
            );

        if (!VALID_BRANCHES.includes(
                selectedBranch
            )) {
            return res.status(400).json({
                message: 'A valid gym branch is required.',
            });
        }

        // ----------------------------------------------------
        // MEMBER BRANCH VALIDATION
        // ----------------------------------------------------

        const memberRecord =
            await findMemberInBranch(
                member,
                selectedBranch
            );

        if (!memberRecord) {
            return res.status(404).json({
                message: 'Member not found in the selected gym branch.',
            });
        }

        // ----------------------------------------------------
        // CREATE
        // ----------------------------------------------------

        const workoutData = {
            gymBranch: selectedBranch,

            member,

            workoutName: finalWorkoutName,

            workoutType: finalWorkoutType,

            exercises: finalExercises,

            notes: notes !== undefined ?
                String(notes).trim() :
                '',
        };

        if (startDate !== undefined) {
            workoutData.startDate =
                startDate;
        }

        if (endDate !== undefined) {
            workoutData.endDate =
                endDate;
        }

        if (finalStatus !== undefined) {
            workoutData.status =
                finalStatus;
        }

        const workout =
            await Workout.create(
                workoutData
            );

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
        return sendServerError(
            res,
            'ADD WORKOUT ERROR',
            error
        );
    }
};

// ============================================================
// GET ALL WORKOUTS
// ============================================================

const getWorkouts = async(
    req,
    res
) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
        }

        // ----------------------------------------------------
        // BRANCH FILTER
        // ----------------------------------------------------

        const query =
            getBranchFilter(req);

        // ----------------------------------------------------
        // INVALID BRANCH REQUEST
        // ----------------------------------------------------

        if (query === null) {
            return res.status(403).json({
                message: 'You do not have access to the selected gym branch.',
            });
        }

        // ----------------------------------------------------
        // DEBUG LOG
        // ----------------------------------------------------

        console.log(
            '[GET WORKOUTS] Branch filter:',
            JSON.stringify(query)
        );

        // ----------------------------------------------------
        // DATABASE QUERY
        // ----------------------------------------------------

        const workouts =
            await Workout.find(query)
            .populate(
                'member',
                'name phone email gymBranch'
            )
            .sort({
                createdAt: -1,
            });

        console.log(
            `[GET WORKOUTS] Found ${workouts.length} workout(s).`
        );

        return res.status(200).json({
            message: 'Workouts fetched successfully.',
            workouts,
        });

    } catch (error) {
        return sendServerError(
            res,
            'GET WORKOUTS ERROR',
            error
        );
    }
};

// ============================================================
// GET SINGLE WORKOUT
// ============================================================

const getWorkoutById = async(
    req,
    res
) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
        }

        const {
            id,
        } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid workout ID.',
            });
        }

        // ----------------------------------------------------
        // BRANCH FILTER
        // ----------------------------------------------------

        const query =
            getBranchFilter(req);

        if (query === null) {
            return res.status(403).json({
                message: 'You do not have access to the selected gym branch.',
            });
        }

        // ----------------------------------------------------
        // FIND WORKOUT
        // ----------------------------------------------------

        const workout =
            await Workout.findOne({
                ...query,
                _id: id,
            })
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
        return sendServerError(
            res,
            'GET WORKOUT ERROR',
            error
        );
    }
};

// ============================================================
// UPDATE WORKOUT
// ============================================================

const updateWorkout = async(
    req,
    res
) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
        }

        const {
            id,
        } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid workout ID.',
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
        } = req.body || {};

        // ----------------------------------------------------
        // CURRENT BRANCH FILTER
        // ----------------------------------------------------

        const currentFilter =
            getBranchFilter(req);

        if (currentFilter === null) {
            return res.status(403).json({
                message: 'You do not have access to the selected gym branch.',
            });
        }

        // ----------------------------------------------------
        // FIND EXISTING WORKOUT
        // ----------------------------------------------------

        const workout =
            await Workout.findOne({
                ...currentFilter,
                _id: id,
            });

        if (!workout) {
            return res.status(404).json({
                message: 'Workout not found.',
            });
        }

        // ----------------------------------------------------
        // FINAL BRANCH
        // ----------------------------------------------------

        let finalBranch =
            normalizeBranch(
                workout.gymBranch
            );

        // Main admin may move workout to
        // another valid branch.
        if (
            isMainAdminRequest(req)
        ) {
            if (
                gymBranch !== undefined &&
                gymBranch !== null &&
                String(
                    gymBranch
                ).trim() !== ''
            ) {
                finalBranch =
                    normalizeBranch(
                        gymBranch
                    );

                if (!VALID_BRANCHES.includes(
                        finalBranch
                    )) {
                    return res.status(400).json({
                        message: 'Invalid gym branch.',
                    });
                }
            }
        } else {
            // Branch users can only update
            // their assigned branch.
            const accessibleBranches =
                getAccessibleBranches(
                    req
                );

            if (!accessibleBranches.includes(
                    finalBranch
                )) {
                return res.status(403).json({
                    message: 'You do not have access to this workout.',
                });
            }

            // Branch users cannot move a workout
            // to another branch.
            if (
                gymBranch !== undefined &&
                normalizeBranch(
                    gymBranch
                ) &&
                normalizeBranch(
                    gymBranch
                ) !== finalBranch
            ) {
                return res.status(403).json({
                    message: 'You cannot move a workout to another gym branch.',
                });
            }
        }

        // ----------------------------------------------------
        // FINAL MEMBER
        // ----------------------------------------------------

        const finalMember =
            member !== undefined ?
            member :
            workout.member;

        if (!finalMember) {
            return res.status(400).json({
                message: 'Member is required.',
            });
        }

        if (!isValidObjectId(
                finalMember
            )) {
            return res.status(400).json({
                message: 'Invalid member ID.',
            });
        }

        // ----------------------------------------------------
        // MEMBER MUST BELONG TO BRANCH
        // ----------------------------------------------------

        const memberRecord =
            await findMemberInBranch(
                finalMember,
                finalBranch
            );

        if (!memberRecord) {
            return res.status(400).json({
                message: 'Member not found in the selected gym branch.',
            });
        }

        // ----------------------------------------------------
        // WORKOUT NAME
        // ----------------------------------------------------

        if (
            workoutName !== undefined
        ) {
            const value =
                String(
                    workoutName
                ).trim();

            if (!value) {
                return res.status(400).json({
                    message: 'Workout name cannot be empty.',
                });
            }

            workout.workoutName =
                value;
        }

        // ----------------------------------------------------
        // WORKOUT TYPE
        // ----------------------------------------------------

        if (
            workoutType !== undefined
        ) {
            const value =
                normalizeWorkoutType(
                    workoutType
                );

            if (!value) {
                return res.status(400).json({
                    message: 'Workout type cannot be empty.',
                });
            }

            if (!VALID_WORKOUT_TYPES.includes(
                    value
                )) {
                return res.status(400).json({
                    message: 'Invalid workout type.',
                });
            }

            workout.workoutType =
                value;
        }

        // ----------------------------------------------------
        // EXERCISES
        // ----------------------------------------------------

        if (
            exercises !== undefined
        ) {
            if (!Array.isArray(
                    exercises
                )) {
                return res.status(400).json({
                    message: 'Exercises must be an array.',
                });
            }

            workout.exercises =
                exercises;
        }

        // ----------------------------------------------------
        // DATES
        // ----------------------------------------------------

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

        // ----------------------------------------------------
        // STATUS
        // ----------------------------------------------------

        if (
            status !== undefined
        ) {
            const finalStatus =
                normalizeStatus(
                    status
                );

            if (!VALID_STATUSES.includes(
                    finalStatus
                )) {
                return res.status(400).json({
                    message: 'Invalid workout status.',
                });
            }

            workout.status =
                finalStatus;
        }

        // ----------------------------------------------------
        // NOTES
        // ----------------------------------------------------

        if (
            notes !== undefined
        ) {
            workout.notes =
                String(
                    notes
                ).trim();
        }

        // ----------------------------------------------------
        // MEMBER
        // ----------------------------------------------------

        workout.member =
            finalMember;

        // ----------------------------------------------------
        // BRANCH
        // ----------------------------------------------------

        workout.gymBranch =
            finalBranch;

        // ----------------------------------------------------
        // SAVE
        // ----------------------------------------------------

        await workout.save();

        // ----------------------------------------------------
        // POPULATE
        // ----------------------------------------------------

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
        return sendServerError(
            res,
            'UPDATE WORKOUT ERROR',
            error
        );
    }
};

// ============================================================
// DELETE WORKOUT
// ============================================================

const deleteWorkout = async(
    req,
    res
) => {
    try {
        if (!ensureAdmin(req, res)) {
            return;
        }

        const {
            id,
        } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid workout ID.',
            });
        }

        // ----------------------------------------------------
        // BRANCH FILTER
        // ----------------------------------------------------

        const query =
            getBranchFilter(req);

        if (query === null) {
            return res.status(403).json({
                message: 'You do not have access to the selected gym branch.',
            });
        }

        // ----------------------------------------------------
        // DELETE
        // ----------------------------------------------------

        const workout =
            await Workout.findOneAndDelete({
                ...query,
                _id: id,
            });

        if (!workout) {
            return res.status(404).json({
                message: 'Workout not found.',
            });
        }

        return res.status(200).json({
            message: 'Workout deleted successfully.',
        });

    } catch (error) {
        return sendServerError(
            res,
            'DELETE WORKOUT ERROR',
            error
        );
    }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    addWorkout,
    getWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout,
};