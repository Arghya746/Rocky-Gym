const Plan = require('../models/Plan');


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
// GET ALL ACTIVE PLANS
// =========================================

const getPlans = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        const query = {
            isActive: true,
        };


        // Receptionist gets only assigned branch
        if (branch) {
            query.gymBranch = branch;
        }


        const plans =
            await Plan.find(query)
            .sort({
                durationMonths: 1,
            });


        res.status(200).json({

            plans,

        });

    } catch (error) {

        console.error(
            'Get Plans Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to fetch membership plans.',

        });
    }
};


// =========================================
// GET ALL PLANS INCLUDING INACTIVE
// =========================================

const getAllPlans = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        const query = {};


        if (branch) {
            query.gymBranch = branch;
        }


        const plans =
            await Plan.find(query)
            .sort({
                durationMonths: 1,
            });


        res.status(200).json({

            plans,

        });

    } catch (error) {

        console.error(
            'Get All Plans Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to fetch membership plans.',

        });
    }
};


// =========================================
// GET SINGLE PLAN
// =========================================

const getPlanById = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        const query = {

            _id: req.params.id,

        };


        if (branch) {
            query.gymBranch = branch;
        }


        const plan =
            await Plan.findOne(query);


        if (!plan) {

            return res.status(404).json({

                message: 'Membership plan not found.',

            });
        }


        res.status(200).json({

            plan,

        });

    } catch (error) {

        console.error(
            'Get Plan Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to fetch membership plan.',

        });
    }
};


// =========================================
// CREATE PLAN
// =========================================

const createPlan = async(req, res) => {
    try {

        const {
            name,
            durationMonths,
            price,
            description,
            gymBranch,
        } = req.body;


        // =========================================
        // VALIDATION
        // =========================================

        if (!name ||
            !durationMonths ||
            price === undefined
        ) {

            return res.status(400).json({

                message: 'Name, duration and price are required.',

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
        // VALIDATE NUMBERS
        // =========================================

        const duration =
            Number(durationMonths);

        const planPrice =
            Number(price);


        if (
            Number.isNaN(duration) ||
            duration < 1
        ) {

            return res.status(400).json({

                message: 'Duration must be a valid number greater than 0.',

            });
        }


        if (
            Number.isNaN(planPrice) ||
            planPrice < 0
        ) {

            return res.status(400).json({

                message: 'Price must be a valid number greater than or equal to 0.',

            });
        }


        // =========================================
        // CREATE PLAN
        // =========================================

        const plan =
            await Plan.create({

                gymBranch: selectedBranch,

                name: name.trim(),

                durationMonths: duration,

                price: planPrice,

                description: description ?
                    description.trim() :
                    '',

            });


        res.status(201).json({

            message: 'Membership plan created successfully.',

            plan,

        });

    } catch (error) {

        console.error(
            'Create Plan Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to create membership plan.',

        });
    }
};


// =========================================
// UPDATE PLAN
// =========================================

const updatePlan = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // =========================================
        // FIND PLAN
        // =========================================

        const query = {

            _id: req.params.id,

        };


        if (branch) {
            query.gymBranch = branch;
        }


        const plan =
            await Plan.findOne(query);


        if (!plan) {

            return res.status(404).json({

                message: 'Membership plan not found.',

            });
        }


        const {
            name,
            durationMonths,
            price,
            description,
            isActive,
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
                plan.gymBranch ||
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
        // UPDATE NAME
        // =========================================

        if (name !== undefined) {

            plan.name =
                name.trim();
        }


        // =========================================
        // UPDATE DURATION
        // =========================================

        if (
            durationMonths !== undefined
        ) {

            const duration =
                Number(durationMonths);


            if (
                Number.isNaN(duration) ||
                duration < 1
            ) {

                return res.status(400).json({

                    message: 'Duration must be a valid number greater than 0.',

                });
            }


            plan.durationMonths =
                duration;
        }


        // =========================================
        // UPDATE PRICE
        // =========================================

        if (price !== undefined) {

            const planPrice =
                Number(price);


            if (
                Number.isNaN(planPrice) ||
                planPrice < 0
            ) {

                return res.status(400).json({

                    message: 'Price must be a valid number greater than or equal to 0.',

                });
            }


            plan.price =
                planPrice;
        }


        // =========================================
        // UPDATE DESCRIPTION
        // =========================================

        if (
            description !== undefined
        ) {

            plan.description =
                description.trim();
        }


        // =========================================
        // UPDATE ACTIVE STATUS
        // =========================================

        if (
            isActive !== undefined
        ) {

            plan.isActive =
                Boolean(isActive);
        }


        // =========================================
        // UPDATE BRANCH
        // =========================================

        plan.gymBranch =
            finalBranch;


        // =========================================
        // SAVE
        // =========================================

        await plan.save();


        res.status(200).json({

            message: 'Membership plan updated successfully.',

            plan,

        });

    } catch (error) {

        console.error(
            'Update Plan Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to update membership plan.',

        });
    }
};


// =========================================
// DELETE / DEACTIVATE PLAN
// =========================================

const deletePlan = async(req, res) => {
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


        const plan =
            await Plan.findOne(query);


        if (!plan) {

            return res.status(404).json({

                message: 'Membership plan not found.',

            });
        }


        // Soft delete
        plan.isActive =
            false;


        await plan.save();


        res.status(200).json({

            message: 'Membership plan deactivated successfully.',

        });

    } catch (error) {

        console.error(
            'Delete Plan Error:',
            error.message
        );

        res.status(500).json({

            message: 'Failed to deactivate membership plan.',

        });
    }
};


// =========================================
// EXPORT CONTROLLERS
// =========================================

module.exports = {

    getPlans,

    getAllPlans,

    getPlanById,

    createPlan,

    updatePlan,

    deletePlan,

};