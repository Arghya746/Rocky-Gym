const Contact = require('../models/Contact');


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


// =========================================
// GET ACCESSIBLE BRANCH
// =========================================
// Main admin:
//   null = access to both branches
//
// Receptionist:
//   assigned branch only
//
// Invalid receptionist branch:
//   null, but caller checks this condition
// =========================================

const getAccessibleBranch = (req) => {

    // Main admin can access both branches
    if (
        req.admin &&
        req.admin.role === 'admin'
    ) {
        return null;
    }

    // Receptionist is restricted to
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
// CREATE CONTACT / ENQUIRY
// =========================================
// PUBLIC ENDPOINT
//
// The public website must provide:
//   gymBranch: "Kalyanpur"
//   OR
//   gymBranch: "Gopalpur"
//
// No login is required here.
// =========================================

const createContact = async(req, res) => {

    try {

        const {
            name,
            phone,
            email,
            message,
            gymBranch,
        } = req.body;


        // =========================================
        // VALIDATE NAME
        // =========================================

        if (!name || !String(name).trim()) {

            return res.status(400).json({

                message: 'Name is required.',

            });
        }


        // =========================================
        // VALIDATE PHONE
        // =========================================

        if (!phone || !String(phone).trim()) {

            return res.status(400).json({

                message: 'Phone is required.',

            });
        }


        // =========================================
        // VALIDATE PUBLIC BRANCH
        // =========================================

        const selectedBranch =
            normalizeBranch(gymBranch);


        if (!selectedBranch) {

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
        // CREATE CONTACT
        // =========================================

        const contact =
            await Contact.create({

                gymBranch: selectedBranch,

                name: String(name).trim(),

                phone: String(phone).trim(),

                email: email ?
                    String(email)
                    .trim()
                    .toLowerCase() :
                    '',

                message: message ?
                    String(message).trim() :
                    '',

            });


        // =========================================
        // RESPONSE
        // =========================================

        return res.status(201).json({

            message: 'Enquiry submitted successfully.',

            contact,

        });

    } catch (error) {

        console.error(
            'Create Contact Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// GET ALL CONTACTS / ENQUIRIES
// =========================================
// PROTECTED
//
// Main admin:
//   Kalyanpur + Gopalpur
//
// Receptionist:
//   assigned branch only
// =========================================

const getContacts = async(req, res) => {

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

        const query = {};


        // Main admin:
        // no branch filter
        //
        // Receptionist:
        // assigned branch filter
        if (branch) {

            query.gymBranch =
                branch;
        }


        // =========================================
        // FETCH CONTACTS
        // =========================================

        const contacts =
            await Contact.find(query)
            .sort({
                createdAt: -1,
            });


        return res.status(200).json({

            message: 'Enquiries fetched successfully.',

            contacts,

        });

    } catch (error) {

        console.error(
            'Get Contacts Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// GET SINGLE CONTACT
// =========================================
// PROTECTED
//
// Main admin:
//   Can access either branch.
//
// Receptionist:
//   Can access only their branch.
// =========================================

const getContactById = async(req, res) => {

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
        // force branch restriction.
        //
        // Main admin:
        // no branch restriction.
        if (branch) {

            query.gymBranch =
                branch;
        }


        // =========================================
        // FIND CONTACT
        // =========================================

        const contact =
            await Contact.findOne(query);


        if (!contact) {

            return res.status(404).json({

                message: 'Enquiry not found.',

            });
        }


        return res.status(200).json({

            contact,

        });

    } catch (error) {

        console.error(
            'Get Contact Error:',
            error.message
        );

        return res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// DELETE CONTACT / ENQUIRY
// =========================================
// PROTECTED
//
// Main admin:
//   Can delete either branch.
//
// Receptionist:
//   Can delete only from assigned branch.
// =========================================

const deleteContact = async(req, res) => {

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
        // force assigned branch.
        //
        // Main admin:
        // can access both branches.
        if (branch) {

            query.gymBranch =
                branch;
        }


        // =========================================
        // DELETE CONTACT
        // =========================================

        const contact =
            await Contact.findOneAndDelete(
                query
            );


        if (!contact) {

            return res.status(404).json({

                message: 'Enquiry not found.',

            });
        }


        return res.status(200).json({

            message: 'Enquiry deleted successfully.',

        });

    } catch (error) {

        console.error(
            'Delete Contact Error:',
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

    createContact,

    getContacts,

    getContactById,

    deleteContact,

};