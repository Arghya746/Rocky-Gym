const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===============================
// ADMIN REGISTER
// ===============================

const registerAdmin = async(req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required.',
            });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({
                message: 'Admin already exists.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: 'Admin registered successfully.',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error(
            'Admin Register Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// ADMIN LOGIN
// ===============================

const loginAdmin = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required.',
            });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({
                message: 'Invalid email or password.',
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password.',
            });
        }

        const token = jwt.sign({
                id: admin._id,
                email: admin.email,
            },
            process.env.JWT_SECRET, {
                expiresIn: '1d',
            }
        );

        res.status(200).json({
            message: 'Login successful.',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error(
            'Admin Login Error:',
            error.message
        );

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

// ===============================
// EXPORT CONTROLLERS
// ===============================

module.exports = {
    registerAdmin,
    loginAdmin,
};