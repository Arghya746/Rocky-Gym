const Payment = require('../models/Payment');


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
        } = req.body;

        if (!member ||
            !invoiceNumber ||
            amount === undefined ||
            !paymentMethod
        ) {
            return res.status(400).json({
                message: 'Member, invoice number, amount and payment method are required.',
            });
        }

        const existingPayment = await Payment.findOne({
            invoiceNumber,
        });

        if (existingPayment) {
            return res.status(400).json({
                message: 'Invoice number already exists.',
            });
        }

        const payment = await Payment.create({
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
        const payments = await Payment.find()
            .populate(
                'member',
                'name phone email membershipPlan'
            )
            .sort({ createdAt: -1 });

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
        const payment = await Payment.findById(
            req.params.id
        ).populate(
            'member',
            'name phone email membershipPlan'
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
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body, {
                new: true,
                runValidators: true,
            }
        );

        if (!payment) {
            return res.status(404).json({
                message: 'Payment not found.',
            });
        }

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
        const payment = await Payment.findByIdAndDelete(
            req.params.id
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