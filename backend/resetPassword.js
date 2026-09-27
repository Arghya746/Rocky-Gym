require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = 'reception@alphagym.com';
        const newPassword = 'Reception@123';

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const admin = await Admin.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    password: hashedPassword,
                    status: 'active'
                }
            },
            { new: true }
        );

        if (!admin) {
            console.log('❌ Receptionist account not found.');
            return;
        }

        console.log('✅ Password reset successfully!');
        console.log('Email:', email);
        console.log('New Password:', newPassword);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

resetPassword();