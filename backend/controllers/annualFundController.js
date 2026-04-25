const { Student } = require("../models/studentSchema");
const mongoose = require("mongoose");

// ✅ COLLECT ANNUAL FUND
const collectAnnualFund = async (req, res) => {
    try {
        const { studentId, amount, date, feeMonth, receivedBy, fatherName } = req.body;
        
        const student = await Student.findById(studentId).populate("sclassName");
        if (!student) return res.status(404).json({ message: "Student not found" });

        // Check if Annual Fund for this specific description (e.g., "Annual Fund 2026") 
        // has already been paid to prevent duplicates
        const alreadyPaid = student.fees.find(f => f.feeMonth === feeMonth);
        if (alreadyPaid) {
            return res.status(400).json({ message: `Annual Fund (${feeMonth}) already paid for this student.` });
        }

        const newFundRecord = {
            _id: new mongoose.Types.ObjectId(),
            amount: Number(amount),
            date: date || new Date(),
            studentName: student.name,
            className: student.sclassName?.sclassName || "No Class",
            fatherName: fatherName || student.fatherName || "-",
            feeMonth: feeMonth, // Used as the Fund Title (e.g., "Annual Fund 2026")
            previousDues: Number(amount),
            totalDues: 0, // Annual funds are usually one-time full payments
            receivedBy: receivedBy || "Admin",
            category: "AnnualFund" // Add this to distinguish from monthly fees
        };

        student.fees.push(newFundRecord);
        await student.save();

        res.status(201).json({ message: "Annual Fund collection successful", record: newFundRecord });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error while collecting fund" });
    }
};

// ✅ GET ANNUAL FUND RECORDS ONLY
const getAnnualFundRecords = async (req, res) => {
    try {
        const students = await Student.find().populate("sclassName");
        let fundCollections = [];

        students.forEach(student => {
            const funds = student.fees.filter(f => f.feeMonth.toLowerCase().includes("fund"));
            funds.forEach(f => {
                fundCollections.push({
                    ...f.toObject(),
                    studentId: student._id,
                    studentName: student.name
                });
            });
        });

        res.status(200).json(fundCollections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching fund records" });
    }
};

module.exports = { collectAnnualFund, getAnnualFundRecords };