const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

const getDashboardStats = async(req, res) => {
    try {
        const totalMembers = await Member.countDocuments();

        const activeMembers = await Member.countDocuments({
            status: 'Active',
        });

        const expiredMembers = await Member.countDocuments({
            status: 'Expired',
        });

        const totalPayments = await Payment.countDocuments();

        const revenueResult = await Payment.aggregate([{
                $match: {
                    status: 'Paid',
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: '$amount',
                    },
                },
            },
        ]);

        const totalRevenue =
            revenueResult.length > 0 ?
            revenueResult[0].totalRevenue :
            0;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const todayAttendance = await Attendance.countDocuments({
            date: {
                $gte: startOfToday,
                $lte: endOfToday,
            },
            status: 'Present',
        });

        res.status(200).json({
            message: 'Dashboard statistics fetched successfully.',
            stats: {
                totalMembers,
                activeMembers,
                expiredMembers,
                totalPayments,
                totalRevenue,
                todayAttendance,
            },
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error.message);

        res.status(500).json({
            message: 'Server error. Please try again.',
        });
    }
};

module.exports = {
    getDashboardStats,
};