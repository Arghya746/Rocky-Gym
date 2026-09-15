const Plan = require('../models/Plan');

// Get all active plans
const getPlans = async(req, res) => {
    try {
        const plans = await Plan.find({ isActive: true })
            .sort({ durationMonths: 1 });

        res.status(200).json({
            plans,
        });
    } catch (error) {
        console.error('Get Plans Error:', error.message);

        res.status(500).json({
            message: 'Failed to fetch membership plans.',
        });
    }
};


// Get all plans including inactive plans
const getAllPlans = async(req, res) => {
    try {
        const plans = await Plan.find()
            .sort({ durationMonths: 1 });

        res.status(200).json({
            plans,
        });
    } catch (error) {
        console.error('Get All Plans Error:', error.message);

        res.status(500).json({
            message: 'Failed to fetch membership plans.',
        });
    }
};


// Get single plan
const getPlanById = async(req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                message: 'Membership plan not found.',
            });
        }

        res.status(200).json({
            plan,
        });
    } catch (error) {
        console.error('Get Plan Error:', error.message);

        res.status(500).json({
            message: 'Failed to fetch membership plan.',
        });
    }
};


// Create plan
const createPlan = async(req, res) => {
    try {
        const {
            name,
            durationMonths,
            price,
            description,
        } = req.body;

        if (!name || !durationMonths || price === undefined) {
            return res.status(400).json({
                message: 'Name, duration and price are required.',
            });
        }

        const plan = await Plan.create({
            name: name.trim(),
            durationMonths: Number(durationMonths),
            price: Number(price),
            description: description ? description.trim() || '' : '',
        });

        res.status(201).json({
            message: 'Membership plan created successfully.',
            plan,
        });
    } catch (error) {
        console.error('Create Plan Error:', error.message);

        res.status(500).json({
            message: 'Failed to create membership plan.',
        });
    }
};


// Update plan
const updatePlan = async(req, res) => {
    try {
        const {
            name,
            durationMonths,
            price,
            description,
            isActive,
        } = req.body;

        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                message: 'Membership plan not found.',
            });
        }

        if (name !== undefined) {
            plan.name = name.trim();
        }

        if (durationMonths !== undefined) {
            plan.durationMonths = Number(durationMonths);
        }

        if (price !== undefined) {
            plan.price = Number(price);
        }

        if (description !== undefined) {
            plan.description = description.trim();
        }

        if (isActive !== undefined) {
            plan.isActive = Boolean(isActive);
        }

        await plan.save();

        res.status(200).json({
            message: 'Membership plan updated successfully.',
            plan,
        });
    } catch (error) {
        console.error('Update Plan Error:', error.message);

        res.status(500).json({
            message: 'Failed to update membership plan.',
        });
    }
};


// Delete/deactivate plan
const deletePlan = async(req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({
                message: 'Membership plan not found.',
            });
        }

        // Soft delete
        plan.isActive = false;

        await plan.save();

        res.status(200).json({
            message: 'Membership plan deactivated successfully.',
        });
    } catch (error) {
        console.error('Delete Plan Error:', error.message);

        res.status(500).json({
            message: 'Failed to deactivate membership plan.',
        });
    }
};


module.exports = {
    getPlans,
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
};