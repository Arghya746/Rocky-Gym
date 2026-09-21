const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');


// ===============================
// GET ACCESSIBLE BRANCH
// ===============================

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


// ===============================
// GET DASHBOARD STATS
// ===============================

const getDashboardStats = async(req, res) => {
    try {

        const branch =
            getAccessibleBranch(req);


        // ===============================
        // BUILD BRANCH QUERIES
        // ===============================

        const memberQuery = branch ?
            { gymBranch: branch } :
            {};

        const paymentQuery = branch ?
            { gymBranch: branch } :
            {};

        const attendanceQuery = branch ?
            { gymBranch: branch } :
            {};


        // ===============================
        // MEMBER STATISTICS
        // ===============================

        const totalMembers =
            await Member.countDocuments(
                memberQuery
            );


        const activeMembers =
            await Member.countDocuments({

                ...memberQuery,

                status: 'Active',

            });


        const expiredMembers =
            await Member.countDocuments({

                ...memberQuery,

                status: 'Expired',

            });


        // ===============================
        // PAYMENT STATISTICS
        // ===============================

        const totalPayments =
            await Payment.countDocuments(
                paymentQuery
            );


        // ===============================
        // TOTAL REVENUE
        // ===============================

        const revenueResult =
            await Payment.aggregate([

                {
                    $match: {

                        ...paymentQuery,

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


        // ===============================
        // TODAY'S DATE
        // ===============================

        const startOfToday =
            new Date();

        startOfToday.setHours(
            0,
            0,
            0,
            0
        );


        const endOfToday =
            new Date();

        endOfToday.setHours(
            23,
            59,
            59,
            999
        );


        // ===============================
        // TODAY'S ATTENDANCE
        // ===============================

        const todayAttendance =
            await Attendance.countDocuments({

                ...attendanceQuery,

                date: {

                    $gte: startOfToday,

                    $lte: endOfToday,

                },

                status: 'Present',

            });


        // ===============================
        // RESPONSE
        // ===============================

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

        console.error(
            'Dashboard Stats Error:',
            error.message
        );

        res.status(500).json({

            message: 'Server error. Please try again.',

        });
    }
};


// ===============================
// EXPORT CONTROLLER
// ===============================

module.exports = {

    getDashboardStats,

};