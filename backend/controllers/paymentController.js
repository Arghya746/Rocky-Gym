const Payment = require('../models/Payment');
const Member = require('../models/Member');

// ============================================================
// CONSTANTS
// ============================================================

const ALLOWED_BRANCHES = [
    'Kalyanpur',
    'Gopalpur',
];

const MAIN_ADMIN_ROLES = [
    'admin',
    'main_admin',
    'super_admin',
];

const BRANCH_USER_ROLES = [
    'receptionist',
    'staff',
];

// ============================================================
// ROLE HELPERS
// ============================================================

const normalizeRole = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase();
};

const getRole = (req) => {
    if (!req || !req.admin) {
        return '';
    }

    return normalizeRole(
        req.admin.role
    );
};

const isMainAdmin = (req) => {
    return MAIN_ADMIN_ROLES.includes(
        getRole(req)
    );
};

const isBranchUser = (req) => {
    return BRANCH_USER_ROLES.includes(
        getRole(req)
    );
};

// ============================================================
// BRANCH HELPERS
// ============================================================

const normalizeBranch = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {
        return '';
    }

    const raw = String(value)
        .trim()
        .toLowerCase();

    if (raw === 'kalyanpur') {
        return 'Kalyanpur';
    }

    if (raw === 'gopalpur') {
        return 'Gopalpur';
    }

    return '';
};

const normalizeBranches = (branches) => {
    if (!Array.isArray(branches)) {
        return [];
    }

    return Array.from(
        new Set(
            branches
            .map(normalizeBranch)
            .filter((branch) =>
                ALLOWED_BRANCHES.includes(
                    branch
                )
            )
        )
    );
};

const getAccessibleBranches = (req) => {
    if (!req || !req.admin) {
        return [];
    }

    // Main admin can access both branches.
    if (isMainAdmin(req)) {
        return [
            ...ALLOWED_BRANCHES,
        ];
    }

    // New multi-branch field.
    const assignedBranches =
        normalizeBranches(
            req.admin.gymBranches
        );

    if (
        assignedBranches.length > 0
    ) {
        return assignedBranches;
    }

    // Legacy single branch.
    const legacyBranch =
        normalizeBranch(
            req.admin.gymBranch
        );

    if (legacyBranch) {
        return [
            legacyBranch,
        ];
    }

    return [];
};

/*
 * IMPORTANT:
 * GET requests may not have req.body.
 *
 * Therefore every request source is checked
 * safely before accessing its properties.
 */
const getRequestedBranch = (
    req,
    explicitBranch
) => {
    if (!req) {
        return normalizeBranch(
            explicitBranch
        );
    }

    const headerBranch =
        req.headers &&
        req.headers['x-gym-branch'];

    const queryGymBranch =
        req.query &&
        req.query.gymBranch;

    const queryBranch =
        req.query &&
        req.query.branch;

    const bodyGymBranch =
        req.body &&
        req.body.gymBranch;

    return normalizeBranch(
        explicitBranch ||
        queryGymBranch ||
        queryBranch ||
        bodyGymBranch ||
        headerBranch ||
        ''
    );
};

// ============================================================
// READ BRANCH FILTER
// ============================================================

const getBranchFilter = (req) => {
    const accessibleBranches =
        getAccessibleBranches(req);

    if (
        accessibleBranches.length === 0
    ) {
        return {
            gymBranch: {
                $in: [],
            },
        };
    }

    const requestedBranch =
        getRequestedBranch(req);

    if (requestedBranch) {
        if (!accessibleBranches.includes(
                requestedBranch
            )) {
            return null;
        }

        return {
            gymBranch: requestedBranch,
        };
    }

    // Main admin without a selected branch.
    // Return both branches.
    if (isMainAdmin(req)) {
        return {
            gymBranch: {
                $in: ALLOWED_BRANCHES,
            },
        };
    }

    // Branch user without a selected branch.
    // They can see all branches assigned to them.
    return {
        gymBranch: {
            $in: accessibleBranches,
        },
    };
};

// ============================================================
// WRITE BRANCH
// ============================================================

const resolveWriteBranch = (
    req,
    requestedBranch
) => {
    const accessibleBranches =
        getAccessibleBranches(req);

    if (
        accessibleBranches.length === 0
    ) {
        return {
            error: 'Your account is not assigned to a valid gym branch.',
            status: 403,
        };
    }

    const branch =
        normalizeBranch(
            requestedBranch
        );

    // Main admin must explicitly select a branch.
    if (isMainAdmin(req)) {
        if (!branch) {
            return {
                error: 'Select Kalyanpur or Gopalpur before creating a payment.',
                status: 400,
            };
        }

        if (!ALLOWED_BRANCHES.includes(
                branch
            )) {
            return {
                error: 'Invalid gym branch.',
                status: 400,
            };
        }

        return {
            branch,
        };
    }

    // Branch user explicitly selected a branch.
    if (branch) {
        if (!accessibleBranches.includes(
                branch
            )) {
            return {
                error: 'You do not have access to the selected gym branch.',
                status: 403,
            };
        }

        return {
            branch,
        };
    }

    // Single assigned branch.
    if (
        accessibleBranches.length === 1
    ) {
        return {
            branch: accessibleBranches[0],
        };
    }

    // Multiple assigned branches require selection.
    return {
        error: 'Select a gym branch before creating a payment.',
        status: 400,
    };
};

// ============================================================
// OBJECT ID
// ============================================================

const isValidObjectId = (value) => {
    return /^[a-fA-F0-9]{24}$/.test(
        String(value || '')
    );
};

// ============================================================
// SERVER ERROR
// ============================================================

const sendServerError = (
    res,
    error
) => {
    console.error(
        '[PAYMENT ERROR]',
        error
    );

    return res.status(500).json({
        message: 'Server error. Please try again.',
    });
};

// ============================================================
// ADD PAYMENT
// ============================================================

const addPayment = async(
    req,
    res
) => {
    try {
        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        const {
            member,
            invoiceNumber,
            amount,
            paymentMethod,
            paymentDate,
            status,
            notes,
            gymBranch,
        } = req.body || {};

        if (!member ||
            !invoiceNumber ||
            amount === undefined ||
            amount === null ||
            !paymentMethod
        ) {
            return res.status(400).json({
                message: 'Member, invoice number, amount and payment method are required.',
            });
        }

        if (!isValidObjectId(member)) {
            return res.status(400).json({
                message: 'Invalid member ID.',
            });
        }

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

        if (!ALLOWED_BRANCHES.includes(
                selectedBranch
            )) {
            return res.status(400).json({
                message: 'A valid gym branch is required.',
            });
        }

        // Make sure member belongs to same branch.
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

        const normalizedInvoiceNumber =
            String(
                invoiceNumber
            ).trim();

        if (!normalizedInvoiceNumber) {
            return res.status(400).json({
                message: 'Invoice number is required.',
            });
        }

        const existingPayment =
            await Payment.findOne({
                invoiceNumber: normalizedInvoiceNumber,
            });

        if (existingPayment) {
            return res.status(400).json({
                message: 'Invoice number already exists.',
            });
        }

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

        const populatedPayment =
            await Payment.findById(
                payment._id
            ).populate(
                'member',
                'name phone email gymBranch'
            );

        return res.status(201).json({
            message: 'Payment added successfully.',
            payment: populatedPayment,
        });
    } catch (error) {
        if (
            error.code === 11000
        ) {
            return res.status(400).json({
                message: 'Invoice number already exists.',
            });
        }

        return sendServerError(
            res,
            error
        );
    }
};

// ============================================================
// GET ALL PAYMENTS
// ============================================================

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

        const query =
            getBranchFilter(req);

        if (query === null) {
            return res.status(403).json({
                message: 'You do not have access to the selected gym branch.',
            });
        }

        const payments =
            await Payment.find(query)
            .populate(
                'member',
                'name phone email gymBranch'
            )
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            message: 'Payments fetched successfully.',
            payments,
        });
    } catch (error) {
        return sendServerError(
            res,
            error
        );
    }
};

// ============================================================
// GET SINGLE PAYMENT
// ============================================================

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

        if (!isValidObjectId(
                req.params.id
            )) {
            return res.status(400).json({
                message: 'Invalid payment ID.',
            });
        }

        const query =
            getBranchFilter(req);

        if (query === null) {
            return res.status(403).json({
                message: 'You do not have access to the selected gym branch.',
            });
        }

        query._id =
            req.params.id;

        const payment =
            await Payment.findOne(
                query
            ).populate(
                'member',
                'name phone email gymBranch'
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
        return sendServerError(
            res,
            error
        );
    }
};

// ============================================================
// UPDATE PAYMENT
// ============================================================

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

        if (!isValidObjectId(
                req.params.id
            )) {
            return res.status(400).json({
                message: 'Invalid payment ID.',
            });
        }

        const currentFilter =
            getBranchFilter(req);

        if (currentFilter === null) {
            return res.status(403).json({
                message: 'You do not have access to the selected gym branch.',
            });
        }

        const existingPayment =
            await Payment.findOne({
                ...currentFilter,
                _id: req.params.id,
            });

        if (!existingPayment) {
            return res.status(404).json({
                message: 'Payment not found.',
            });
        }

        const {
            member,
            invoiceNumber,
            amount,
            paymentMethod,
            paymentDate,
            status,
            notes,
            gymBranch,
        } = req.body || {};

        // ----------------------------------------------------
        // FINAL BRANCH
        // ----------------------------------------------------

        let finalBranch =
            normalizeBranch(
                existingPayment.gymBranch
            );

        if (isMainAdmin(req)) {
            if (
                gymBranch !== undefined
            ) {
                finalBranch =
                    normalizeBranch(
                        gymBranch
                    );

                if (!ALLOWED_BRANCHES.includes(
                        finalBranch
                    )) {
                    return res.status(400).json({
                        message: 'Invalid gym branch.',
                    });
                }
            }
        } else {
            const assignedBranches =
                getAccessibleBranches(
                    req
                );

            if (!assignedBranches.includes(
                    finalBranch
                )) {
                return res.status(403).json({
                    message: 'You do not have access to this payment branch.',
                });
            }

            // Branch users can never move payment.
            finalBranch =
                assignedBranches.length === 1 ?
                assignedBranches[0] :
                normalizeBranch(
                    gymBranch
                ) || finalBranch;

            if (!assignedBranches.includes(
                    finalBranch
                )) {
                return res.status(403).json({
                    message: 'You do not have access to the selected gym branch.',
                });
            }
        }

        // ----------------------------------------------------
        // MEMBER
        // ----------------------------------------------------

        if (member !== undefined) {
            if (!isValidObjectId(member)) {
                return res.status(400).json({
                    message: 'Invalid member ID.',
                });
            }

            const memberRecord =
                await Member.findOne({
                    _id: member,
                    gymBranch: finalBranch,
                });

            if (!memberRecord) {
                return res.status(400).json({
                    message: 'Member not found in the selected gym branch.',
                });
            }
        }

        // ----------------------------------------------------
        // INVOICE
        // ----------------------------------------------------

        let finalInvoice =
            existingPayment.invoiceNumber;

        if (
            invoiceNumber !== undefined
        ) {
            finalInvoice =
                String(
                    invoiceNumber
                ).trim();

            if (!finalInvoice) {
                return res.status(400).json({
                    message: 'Invoice number is required.',
                });
            }

            const duplicate =
                await Payment.findOne({
                    invoiceNumber: finalInvoice,

                    _id: {
                        $ne: req.params.id,
                    },
                });

            if (duplicate) {
                return res.status(400).json({
                    message: 'Invoice number already exists.',
                });
            }
        }

        // ----------------------------------------------------
        // UPDATE ONLY ALLOWED FIELDS
        // ----------------------------------------------------

        existingPayment.gymBranch =
            finalBranch;

        if (member !== undefined) {
            existingPayment.member =
                member;
        }

        existingPayment.invoiceNumber =
            finalInvoice;

        if (amount !== undefined) {
            existingPayment.amount =
                amount;
        }

        if (
            paymentMethod !== undefined
        ) {
            existingPayment.paymentMethod =
                paymentMethod;
        }

        if (
            paymentDate !== undefined
        ) {
            existingPayment.paymentDate =
                paymentDate;
        }

        if (status !== undefined) {
            existingPayment.status =
                status;
        }

        if (notes !== undefined) {
            existingPayment.notes =
                notes;
        }

        await existingPayment.save();

        const payment =
            await Payment.findById(
                existingPayment._id
            ).populate(
                'member',
                'name phone email gymBranch'
            );

        return res.status(200).json({
            message: 'Payment updated successfully.',
            payment,
        });
    } catch (error) {
        if (
            error.code === 11000
        ) {
            return res.status(400).json({
                message: 'Invoice number already exists.',
            });
        }

        return sendServerError(
            res,
            error
        );
    }
};

// ============================================================
// DELETE PAYMENT
// ============================================================

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

        if (!isValidObjectId(
                req.params.id
            )) {
            return res.status(400).json({
                message: 'Invalid payment ID.',
            });
        }

        const query =
            getBranchFilter(req);

        if (query === null) {
            return res.status(403).json({
                message: 'You do not have access to the selected gym branch.',
            });
        }

        query._id =
            req.params.id;

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
        return sendServerError(
            res,
            error
        );
    }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    addPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
};