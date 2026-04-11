const { Student } = require("../models/studentSchema");
const mongoose = require("mongoose");

// ✅ ADD FEE
const addFees = async (req, res) => {
    try {
        const { studentId, amount, date } = req.body; // Receive date from frontend
        const student = await Student.findById(studentId).populate("sclassName");

        if (!student) return res.status(404).json({ message: "Student not found" });

        const selectedDate = new Date(date);
        const currentMonth = selectedDate.getMonth();
        const currentYear = selectedDate.getFullYear();

        // Check if fee already exists for the SELECTED month
        const alreadyPaid = student.fees.find(fee => {
            const d = new Date(fee.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        if (alreadyPaid) return res.status(400).json({ message: "Fee already paid for this selected month" });

        const newFee = {
            _id: new mongoose.Types.ObjectId(),
            amount: Number(amount),
            date: selectedDate, // Store the custom date
            studentName: student.name,
            className: student.sclassName?.sclassName || "No Class"
        };

        student.fees.push(newFee);
        await student.save();
        res.status(200).json({ message: "Fee added", fee: newFee });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const getAllFees = async (req, res) => {
    try {
        // Populate the class reference
        const students = await Student.find().populate("sclassName");

        if (!students || students.length === 0) {
            return res.status(200).json([]); // Return empty list instead of crashing
        }

        let allFees = [];

        students.forEach(student => {
            // Safe check: ensure student has fees and fees is an array
            if (student.fees && Array.isArray(student.fees)) {
                student.fees.forEach(fee => {
                    allFees.push({
                        _id: fee._id,
                        studentId: student._id,
                        amount: fee.amount,
                        date: fee.date,
                        studentName: student.name || "Unknown",
                        // ✅ FIX: Use optional chaining (?.) and a fallback string
                        // This prevents the "Cannot read property 'sclassName' of null" crash
                        className: student.sclassName?.sclassName || "Class Not Assigned"
                    });
                });
            }
        });

        res.status(200).json(allFees);

    } catch (error) {
        // Check your BACKEND terminal for this specific log
        console.error("Error in getAllFees:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
// DELETE FEE
const deleteFee = async (req, res) => {
    try {
        const feeId = req.params.id;

        const student = await Student.findOne({ "fees._id": feeId });

        if (!student) {
            return res.status(404).json({ message: "Fee not found" });
        }

        student.fees = student.fees.filter(
            (fee) => fee._id.toString() !== feeId
        );

        await student.save();

        res.status(200).json({ message: "Fee deleted" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting fee" });
    }
};

// EDIT FEE
const editFee = async (req, res) => {
    try {
        const feeId = req.params.id;
        const { amount } = req.body;

        const student = await Student.findOne({
            "fees._id": feeId
        });

        if (!student) {
            return res.status(404).json({ message: "Fee not found" });
        }

        // ✅ FIND & UPDATE specific fee
        const fee = student.fees.id(feeId);

        if (!fee) {
            return res.status(404).json({ message: "Fee not found" });
        }

        fee.amount = amount;

        await student.save();

        res.status(200).json({ message: "Fee updated" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};
// ✅ GET FEES
const getStudentFees = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({
            fees: student.fees || []   // ✅ SAFE
        });

    } catch (error) {
        console.log("GET FEES ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};
module.exports = {
    addFees,
    getStudentFees, getAllFees, deleteFee ,editFee,// ✅ EXPORT THIS
};