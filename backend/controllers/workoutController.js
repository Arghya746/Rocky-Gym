const Workout = require('../models/Workout');


// Add workout plan
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
        } = req.body;

        if (!member || !workoutName || !workoutType) {
            return res.status(400).json({
                message: 'Member, workout name and workout type are required.',
            });
        }

        const workout = await Workout.create({
            member,
            workoutName,
            workoutType,
            exercises,
            startDate,
            endDate,
            status,
            notes,
        });

        res.status(201).json({
            message: 'Workout added successfully.',
            workout,
        });

    } catch (error) {
        console.error('Add Workout Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// Get all workouts
const getWorkouts = async(req, res) => {
    try {
        const workouts = await Workout.find()
            .populate('member', 'name phone email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Workouts fetched successfully.',
            workouts,
        });

    } catch (error) {
        console.error('Get Workouts Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// Get workout by ID
const getWorkoutById = async(req, res) => {
    try {
        const workout = await Workout.findById(req.params.id)
            .populate('member', 'name phone email');

        if (!workout) {
            return res.status(404).json({
                message: 'Workout not found.',
            });
        }

        res.status(200).json({
            workout,
        });

    } catch (error) {
        console.error('Get Workout Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// Update workout
const updateWorkout = async(req, res) => {
    try {
        const workout = await Workout.findByIdAndUpdate(
            req.params.id,
            req.body, {
                new: true,
                runValidators: true,
            }
        ).populate('member', 'name phone email');

        if (!workout) {
            return res.status(404).json({
                message: 'Workout not found.',
            });
        }

        res.status(200).json({
            message: 'Workout updated successfully.',
            workout,
        });

    } catch (error) {
        console.error('Update Workout Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


// Delete workout
const deleteWorkout = async(req, res) => {
    try {
        const workout = await Workout.findByIdAndDelete(
            req.params.id
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
        console.error('Delete Workout Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};


module.exports = {
    addWorkout,
    getWorkouts,
    getWorkoutById,
    updateWorkout,
    deleteWorkout,
};