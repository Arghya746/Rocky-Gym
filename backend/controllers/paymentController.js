const Payment = require('../models/Payment');


// ===============================
// GET ACCESSIBLE BRANCH
// ===============================

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


// ===============================
// ADD PAYMENT
// ===============================

const addPayment = async(req, res) => {
    try {

        const {
            member,
            invoiceNumber,
            amount,
            paymentMethod,
            paymentDate,
            status,
            notes,
            gymBranch,
        } = req.body;


        // ===============================
        // VALIDATION
        // ===============================

        if (!member ||
            !invoiceNumber ||
            amount === undefined ||
            !paymentMethod
        ) {
            return res.status(400).json({
                message: 'Member, invoice number, amount and payment method are required.',
            });
        }


        // ===============================
        // DETERMINE BRANCH
        // ===============================

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


        // ===============================
        // VALIDATE BRANCH
        // ===============================

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


        // ===============================
        // CHECK INVOICE NUMBER
        // ===============================

        const existingPayment =
            await Payment.findOne({
                invoiceNumber,
            });


        if (existingPayment) {
            return res.status(400).json({
                message: 'Invoice number already exists.',
            });
        }


        // ===============================
        // CREATE PAYMENT
        // ===============================

        const payment =
            await Payment.create({

                gymBranch: selectedBranch,

                member,

                invoiceNumber,

                amount,

                paymentMethod,

                paymentDate,

                status,

                notes,

            });


        res.status(201).json({

            message: 'Payment added successfully.',

            payment,

        });

    } catch (error) {

        console.error(
            'Add Payment Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// GET ALL PAYMENTS
// ===============================

const getPayments = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD QUERY
        // ===============================

        const query = branch ?
            { gymBranch: branch } :
            {};


        const payments =
            await Payment.find(query)
            .populate(
                'member',
                'name phone email membershipPlan gymBranch'
            )
            .sort({
                createdAt: -1,
            });


        res.status(200).json({

            message: 'Payments fetched successfully.',

            payments,

        });

    } catch (error) {

        console.error(
            'Get Payments Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// GET SINGLE PAYMENT
// ===============================

const getPaymentById = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD QUERY
        // ===============================

        const query = {
            _id: req.params.id,
        };


        if (branch) {
            query.gymBranch = branch;
        }


        const payment =
            await Payment.findOne(query)
            .populate(
                'member',
                'name phone email membershipPlan gymBranch'
            );


        if (!payment) {

            return res.status(404).json({

                message: 'Payment not found.',

            });
        }


        res.status(200).json({

            payment,

        });

    } catch (error) {

        console.error(
            'Get Payment Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// UPDATE PAYMENT
// ===============================

const updatePayment = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // FIND PAYMENT
        // ===============================

        const query = {
            _id: req.params.id,
        };


        if (branch) {
            query.gymBranch = branch;
        }


        const existingPayment =
            await Payment.findOne(query);


        if (!existingPayment) {

            return res.status(404).json({

                message: 'Payment not found.',

            });
        }


        // ===============================
        // PREVENT RECEPTIONIST
        // FROM CHANGING BRANCH
        // ===============================

        let updateData = {
            ...req.body,
        };


        if (branch) {

            updateData.gymBranch =
                branch;

        } else if (!updateData.gymBranch) {

            updateData.gymBranch =
                existingPayment.gymBranch;
        }


        // ===============================
        // VALIDATE BRANCH
        // ===============================

        const allowedBranches = [
            'Kalyanpur',
            'Gopalpur',
        ];


        if (!allowedBranches.includes(
                updateData.gymBranch
            )) {

            return res.status(400).json({

                message: 'Invalid gym branch.',

            });
        }


        // ===============================
        // UPDATE PAYMENT
        // ===============================

        const payment =
            await Payment.findByIdAndUpdate(

                req.params.id,

                updateData,

                {
                    new: true,
                    runValidators: true,
                }

            ).populate(
                'member',
                'name phone email membershipPlan gymBranch'
            );


        res.status(200).json({

            message: 'Payment updated successfully.',

            payment,

        });

    } catch (error) {

        console.error(
            'Update Payment Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// DELETE PAYMENT
// ===============================

const deletePayment = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD QUERY
        // ===============================

        const query = {
            _id: req.params.id,
        };


        if (branch) {
            query.gymBranch = branch;
        }


        const payment =
            await Payment.findOneAndDelete(
                query
            );


        if (!payment) {

            return res.status(404).json({

                message: 'Payment not found.',

            });
        }


        res.status(200).json({

            message: 'Payment deleted successfully.',

        });

    } catch (error) {

        console.error(
            'Delete Payment Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// EXPORTS
// ===============================

module.exports = {

    addPayment,

    getPayments,

    getPaymentById,

    updatePayment,

    deletePayment,

};