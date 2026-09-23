const Payment = require('../models/Payment');
const Member = require('../models/Member');

const ALLOWED_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

// ===============================
// NORMALIZE BRANCH
// ===============================

const normalizeBranch = (value) => {
    if (!value) return null;

    const normalized = String(value)
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

// ===============================
// GET ACCESSIBLE BRANCH
// ===============================

const getAccessibleBranch = (req) => {
    if (!req.admin) {
        return null;
    }

    // Main admin can access both branches.
    if (req.admin.role === 'admin') {
        return null;
    }

    // Receptionist can access only
    // their assigned branch.
    return normalizeBranch(
        req.admin.gymBranch
    );
};

// ===============================
// GET WRITE BRANCH
// ===============================

const getWriteBranch = (
    req,
    requestedBranch
) => {
    if (!req.admin) {
        return {
            error: 'Not authorized.',
            status: 401,
        };
    }

    // Main admin must explicitly
    // select a valid branch.
    if (req.admin.role === 'admin') {
        const branch =
            normalizeBranch(
                requestedBranch
            );

        if (!branch) {
            return {
                error: 'Select Kalyanpur or Gopalpur before creating a payment.',
                status: 400,
            };
        }

        return {
            branch,
        };
    }

    // Receptionist uses only
    // their assigned branch.
    const branch =
        normalizeBranch(
            req.admin.gymBranch
        );

    if (!branch) {
        return {
            error: 'Your account is not assigned to a valid gym branch.',
            status: 403,
        };
    }

    return {
        branch,
    };
};

// ===============================
// ADD PAYMENT
// ===============================

const addPayment = async(
    req,
    res
) => {
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

        const branchResult =
            getWriteBranch(
                req,
                gymBranch
            );

        if (branchResult.error) {
            return res.status(
                branchResult.status
            ).json({
                message: branchResult.error,
            });
        }

        const selectedBranch =
            branchResult.branch;

        // ===============================
        // VALIDATE BRANCH
        // ===============================

        if (!ALLOWED_BRANCHES.includes(
                selectedBranch
            )) {
            return res.status(400).json({
                message: 'Invalid gym branch.',
            });
        }

        // ===============================
        // VERIFY MEMBER BRANCH
        // ===============================

        const memberRecord =
            await Member.findOne({
                _id: member,
                gymBranch: selectedBranch,
            });

        if (!memberRecord) {
            return res.status(400).json({
                message: 'Member not found in the selected gym branch.',
            });
        }

        // ===============================
        // CHECK INVOICE NUMBER
        // ===============================

        const normalizedInvoiceNumber =
            String(invoiceNumber).trim();

        const existingPayment =
            await Payment.findOne({
                invoiceNumber: normalizedInvoiceNumber,
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

                invoiceNumber: normalizedInvoiceNumber,

                amount,

                paymentMethod,

                paymentDate,

                status,

                notes,
            });

        return res.status(201).json({
            message: 'Payment added successfully.',

            payment,
        });
    } catch (error) {
        console.error(
            'Add Payment Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// GET ALL PAYMENTS
// ===============================

const getPayments = async(
    req,
    res
) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        // Receptionist without branch
        // must not see any payment data.
        if (
            req.admin.role ===
            'receptionist' &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        const query = branch ?
            {
                gymBranch: branch,
            } :
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

        return res.status(200).json({
            message: 'Payments fetched successfully.',

            payments,
        });
    } catch (error) {
        console.error(
            'Get Payments Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// GET SINGLE PAYMENT
// ===============================

const getPaymentById = async(
    req,
    res
) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        if (
            req.admin.role ===
            'receptionist' &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

        const query = {
            _id: req.params.id,
        };

        if (branch) {
            query.gymBranch = branch;
        }

        const payment =
            await Payment.findOne(
                query
            ).populate(
                'member',
                'name phone email membershipPlan gymBranch'
            );

        if (!payment) {
            return res.status(404).json({
                message: 'Payment not found.',
            });
        }

        return res.status(200).json({
            payment,
        });
    } catch (error) {
        console.error(
            'Get Payment Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// UPDATE PAYMENT
// ===============================

const updatePayment = async(
    req,
    res
) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        if (
            req.admin.role ===
            'receptionist' &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

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

        const updateData = {
            ...req.body,
        };

        // ===============================
        // RECEPTIONIST BRANCH PROTECTION
        // ===============================

        if (
            req.admin.role ===
            'receptionist'
        ) {
            // Receptionist cannot change
            // payment branch.
            updateData.gymBranch =
                branch;
        } else {
            // Main admin can change branch,
            // but only to a valid branch.
            const requestedBranch =
                normalizeBranch(
                    updateData.gymBranch
                );

            if (
                updateData.gymBranch !==
                undefined &&
                !requestedBranch
            ) {
                return res.status(400).json({
                    message: 'Invalid gym branch.',
                });
            }

            updateData.gymBranch =
                requestedBranch ||
                normalizeBranch(
                    existingPayment.gymBranch
                );

            if (!updateData.gymBranch) {
                return res.status(400).json({
                    message: 'Payment has no valid gym branch.',
                });
            }
        }

        // ===============================
        // VALIDATE FINAL BRANCH
        // ===============================

        if (!ALLOWED_BRANCHES.includes(
                updateData.gymBranch
            )) {
            return res.status(400).json({
                message: 'Invalid gym branch.',
            });
        }

        // ===============================
        // VERIFY MEMBER BRANCH
        // ===============================

        if (updateData.member) {
            const memberRecord =
                await Member.findOne({
                    _id: updateData.member,
                    gymBranch: updateData.gymBranch,
                });

            if (!memberRecord) {
                return res.status(400).json({
                    message: 'Member not found in the selected gym branch.',
                });
            }
        }

        // ===============================
        // INVOICE VALIDATION
        // ===============================

        if (
            updateData.invoiceNumber !==
            undefined
        ) {
            const normalizedInvoiceNumber =
                String(
                    updateData.invoiceNumber
                ).trim();

            const duplicateInvoice =
                await Payment.findOne({
                    invoiceNumber: normalizedInvoiceNumber,

                    _id: {
                        $ne: req.params.id,
                    },
                });

            if (duplicateInvoice) {
                return res.status(400).json({
                    message: 'Invoice number already exists.',
                });
            }

            updateData.invoiceNumber =
                normalizedInvoiceNumber;
        }

        // ===============================
        // UPDATE PAYMENT
        // ===============================

        const payment =
            await Payment.findByIdAndUpdate(
                req.params.id,
                updateData, {
                    new: true,
                    runValidators: true,
                }
            ).populate(
                'member',
                'name phone email membershipPlan gymBranch'
            );

        return res.status(200).json({
            message: 'Payment updated successfully.',

            payment,
        });
    } catch (error) {
        console.error(
            'Update Payment Error:',
            error
        );

        return res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// DELETE PAYMENT
// ===============================

const deletePayment = async(
    req,
    res
) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const branch =
            getAccessibleBranch(req);

        if (
            req.admin.role ===
            'receptionist' &&
            !branch
        ) {
            return res.status(403).json({
                message: 'Your account is not assigned to a valid gym branch.',
            });
        }

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

        return res.status(200).json({
            message: 'Payment deleted successfully.',
        });
    } catch (error) {
        console.error(
            'Delete Payment Error:',
            error
        );

        return res.status(500).json({
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