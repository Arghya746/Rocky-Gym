const express = require('express');
const Contact = require('../models/Contact');

const {
    protect,
    requirePermission,
} = require('../middleware/authMiddleware');

const router = express.Router();


// ===============================
// POST - Create Contact Enquiry
// PUBLIC
// ===============================

router.post('/', async(req, res) => {
    try {
        const { name, phone, goal, message } = req.body;

        if (!name || !phone || !goal) {
            return res.status(400).json({
                message: 'Name, phone and goal are required.',
            });
        }

        const contact = await Contact.create({
            name,
            phone,
            goal,
            message,
        });

        res.status(201).json({
            message: 'Enquiry submitted successfully!',
            contact,
        });

    } catch (error) {
        console.error(
            'Contact Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
});


// ===============================
// GET - Get All Contact Enquiries
// PROTECTED
// ===============================

router.get(
    '/',
    protect,
    requirePermission('enquiries.view'),
    async(req, res) => {
        try {
            const contacts =
                await Contact.find()
                .sort({ createdAt: -1 });

            res.status(200).json({
                contacts,
            });

        } catch (error) {
            console.error(
                'Fetch Contacts Error:',
                error.message
            );

            res.status(500).json({
                message: 'Server error. Please try again.',
            });
        }
    }
);


// ===============================
// DELETE - Delete Contact Enquiry
// PROTECTED
// ===============================

router.delete(
    '/:id',
    protect,
    requirePermission('enquiries.delete'),
    async(req, res) => {
        try {
            const contact =
                await Contact.findByIdAndDelete(
                    req.params.id
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
    }
);


module.exports = router;