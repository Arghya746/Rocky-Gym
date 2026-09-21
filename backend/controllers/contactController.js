const Contact = require('../models/Contact');


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
// CREATE CONTACT / ENQUIRY
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
        // VALIDATION
        // =========================================

        if (!name || !phone) {

            return res.status(400).json({

                message: 'Name and phone are required.',

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

        } else if (
            req.admin &&
            req.admin.gymBranch
        ) {

            // Receptionist uses assigned branch
            selectedBranch =
                req.admin.gymBranch;

        } else {

            // Public website / old requests
            selectedBranch =
                gymBranch || 'Kalyanpur';
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
        // CREATE CONTACT
        // =========================================

        const contact =
            await Contact.create({

                gymBranch: selectedBranch,

                name: name.trim(),

                phone: phone.trim(),

                email: email ?
                    email.trim().toLowerCase() :
                    '',

                message: message ?
                    message.trim() :
                    '',

            });


        res.status(201).json({

            message: 'Enquiry submitted successfully.',

            contact,

        });

    } catch (error) {

        console.error(
            'Create Contact Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// GET ALL CONTACTS / ENQUIRIES
// =========================================

const getContacts = async(req, res) => {
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


        const contacts =
            await Contact.find(query)
            .sort({
                createdAt: -1,
            });


        res.status(200).json({

            message: 'Enquiries fetched successfully.',

            contacts,

        });

    } catch (error) {

        console.error(
            'Get Contacts Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// GET SINGLE CONTACT
// =========================================

const getContactById = async(req, res) => {
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


        const contact =
            await Contact.findOne(query);


        if (!contact) {

            return res.status(404).json({

                message: 'Enquiry not found.',

            });
        }


        res.status(200).json({

            contact,

        });

    } catch (error) {

        console.error(
            'Get Contact Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// =========================================
// DELETE CONTACT / ENQUIRY
// =========================================

const deleteContact = async(req, res) => {
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


        const contact =
            await Contact.findOneAndDelete(
                query
            );


        if (!contact) {

            return res.status(404).json({

                message: 'Enquiry not found.',

            });
        }


        res.status(200).json({

            message: 'Enquiry deleted successfully.',

        });

    } catch (error) {

        console.error(
            'Delete Contact Error:',
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

    createContact,

    getContacts,

    getContactById,

    deleteContact,

};