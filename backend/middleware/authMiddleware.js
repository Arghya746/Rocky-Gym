const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');


// =====================================
// PROTECT ROUTES
// =====================================

const protect = async(req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization;

        if (!authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {
            return res.status(401).json({
                message: 'Not authorized. No token provided.',
            });
        }

        const token =
            authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({
                message: 'User account not found.',
            });
        }

        if (admin.status !== 'active') {
            return res.status(403).json({
                message: 'Your account has been deactivated.',
            });
        }

        req.admin = admin;

        next();

    } catch (error) {
        console.error(
            'Auth Error:',
            error.message
        );

        return res.status(401).json({
            message: 'Invalid or expired token.',
        });
    }
};


// =====================================
// ROLE AUTHORIZATION
// =====================================

const authorize = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        if (!allowedRoles.includes(
                req.admin.role
            )) {
            return res.status(403).json({
                message: 'Access denied. You do not have permission.',
            });
        }

        next();
    };
};


// =====================================
// PERMISSION AUTHORIZATION
// =====================================

const requirePermission = (permission) => {
    return (req, res, next) => {

        if (!req.admin) {
            return res.status(401).json({
                message: 'Not authorized.',
            });
        }

        // Owner/Admin has full access
        if (req.admin.role === 'admin') {
            return next();
        }

        // Receptionist permission check
        const permissions =
            req.admin.permissions || {};

        const parts =
            permission.split('.');

        let current =
            permissions;

        for (const part of parts) {
            current = current && current[part];
        }

        if (current !== true) {
            return res.status(403).json({
                message: 'Access denied. You do not have permission.',
            });
        }

        next();
    };
};


module.exports = protect;

module.exports.protect = protect;

module.exports.authorize = authorize;

module.exports.requirePermission =
    requirePermission;