const Admission = require('../models/Admission');
const Fee = require('../models/Fee');

/**
 * GET Class-wise Fee Status
 */
const getClassWiseTracker = async (req, res) => {
    try {
        const [students, paidRecords] = await Promise.all([
            Admission.find({}).select('_id studentName fatherName className'),
            Fee.find({}).select('studentName className')
        ]);

        // Create a Set of paid students (safe + fast)
        const paidSet = new Set(
            paidRecords.map(record => 
                `${record.studentName?.trim().toLowerCase()}-${record.className}`
            )
        );

        const trackerData = students.map(student => {
            const key = `${student.studentName?.trim().toLowerCase()}-${student.className}`;

            return {
                _id: student._id,
                studentName: student.studentName,
                fatherName: student.fatherName,
                className: student.className,
                status: paidSet.has(key) ? 'Paid' : 'Unpaid'
            };
        });

        // Group by class
        const groupedByClass = trackerData.reduce((acc, curr) => {
            if (!acc[curr.className]) acc[curr.className] = [];
            acc[curr.className].push(curr);
            return acc;
        }, {});

        res.status(200).json(groupedByClass);

    } catch (error) {
        console.error("Tracker Error:", error);
        res.status(500).json({
            message: "Failed to generate fee tracking data",
            error: error.message
        });
    }
};


/**
 * GET Monthly Summary
 */
const getFeeStats = async (req, res) => {
    try {
        const totalStudents = await Admission.countDocuments();

        // Get unique students who paid
        const paidStudentsData = await Fee.distinct('studentName');
        const paidStudents = paidStudentsData.length;

        const stats = {
            total: totalStudents,
            paid: paidStudents,
            unpaid: totalStudents - paidStudents,
            percentage:
                totalStudents > 0
                    ? ((paidStudents / totalStudents) * 100).toFixed(2)
                    : 0
        };

        res.status(200).json(stats);

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({
            message: "Error fetching statistics",
            error: error.message
        });
    }
};

module.exports = {
    getClassWiseTracker,
    getFeeStats
};