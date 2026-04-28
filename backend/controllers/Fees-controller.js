import { Student } from "../models/studentSchema.js";
import mongoose from 'mongoose';

// ✅ ADD FEE
export const addFees = async (req, res) => {
    try {
        const { 
            studentId, 
            amount, 
            date, 
            fatherName, 
            feeMonth, 
            previousDues, 
            receivedBy 
        } = req.body; 
        
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

        // ✅ Calculate balance properly
        const safePrevious = Number(previousDues) || 0;
        const safeAmount = Number(amount) || 0;
        const calculatedBalance = safePrevious - safeAmount;

        const newFee = {
            _id: new mongoose.Types.ObjectId(),
            amount: safeAmount,
            date: selectedDate,
            studentName: student.name,
            className: student.sclassName?.sclassName || "No Class",
            fatherName: fatherName || "-",
            feeMonth: feeMonth || "-",
            previousDues: safePrevious,
            totalDues: calculatedBalance,
            receivedBy: receivedBy || "-"
        };

        student.fees.push(newFee);
        await student.save();
        res.status(200).json({ message: "Fee added successfully", fee: newFee });
    } catch (err) {
        console.error("ADD FEE ERROR:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// ✅ GET ALL FEES (For Admin Dashboard)
export const getAllFees = async (req, res) => {
    try {
        const students = await Student.find().populate("sclassName");
        let allFees = [];

        students.forEach(student => {
            if (student.fees && Array.isArray(student.fees)) {
                student.fees.forEach(fee => {
                    allFees.push({
                        ...fee.toObject(),
                        studentId: student._id,
                        studentName: student.name,
                        className: student.sclassName?.sclassName || "Unassigned"
                    });
                });
            }
        });

        // Sort by date (newest first) instead of name for financial clarity
        allFees.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ allFees }); 
    } catch (err) {
        res.status(500).json({ message: "Error fetching fees", error: err.message });
    }
};

// ✅ DELETE FEE
export const deleteFee = async (req, res) => {
    try {
        const feeId = req.params.id;
        const student = await Student.findOne({ "fees._id": feeId });

        if (!student) return res.status(404).json({ message: "Fee record not found" });

        student.fees = student.fees.filter(
            (fee) => fee._id.toString() !== feeId
        );

        await student.save();
        res.status(200).json({ message: "Fee deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting fee", error: err.message });
    }
};

// ✅ EDIT FEE
export const editFee = async (req, res) => {
    try {
        const feeId = req.params.id;
        const { amount } = req.body;

        const student = await Student.findOne({ "fees._id": feeId });
        if (!student) return res.status(404).json({ message: "Student/Fee not found" });

        const fee = student.fees.id(feeId);
        if (!fee) return res.status(404).json({ message: "Fee details not found" });

        // Update amount and recalculate the totalDues for this specific record
        fee.amount = Number(amount);
        fee.totalDues = fee.previousDues - fee.amount;

        await student.save();
        res.status(200).json({ message: "Fee updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error during edit", error: err.message });
    }
};

// ✅ GET STUDENT FEES
export const getStudentFees = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });

        res.status(200).json({
            fees: student.fees || []
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};