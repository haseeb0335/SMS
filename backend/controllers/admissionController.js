const Admission = require('../models/Admission');
const ExamFee = require('../models/ExamFee');

const createAdmission = async (req, res) => {
    try {
        const newAdmission = new Admission(req.body);
        const savedAdmission = await newAdmission.save();
        res.status(201).json(savedAdmission);
    } catch (error) {
        res.status(400).json({ message: "Error saving admission record", error });
    }
};

const getAllAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find().sort({ createdAt: -1 });
        res.status(200).json(admissions);
    } catch (error) {
        console.error(error); // 👈 ADD THIS
        res.status(500).json({ message: "Error fetching admissions", error });
    }
};

const updateAdmission = async (req, res) => {
    try {
        const updatedAdmission = await Admission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedAdmission);
    } catch (error) {
        res.status(400).json({ message: "Error updating record", error });
    }
};

const deleteAdmission = async (req, res) => {
    try {
        await Admission.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Admission record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting record", error });
    }
};
const createExamFee = async (req, res) => {
    try {
        const newFee = new ExamFee(req.body);
        const savedFee = await newFee.save();
        res.status(201).json(savedFee);
    } catch (error) {
        console.error("Error saving exam fee:", error);
        res.status(400).json({ message: "Error saving exam fee structure", error });
    }
};

const getAllExamFees = async (req, res) => {
    try {
        const fees = await ExamFee.find().sort({ className: 1 });
        res.status(200).json(fees);
    } catch (error) {
        res.status(500).json({ message: "Error fetching exam fees", error });
    }
};

const deleteExamFee = async (req, res) => {
    try {
        await ExamFee.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Structure deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting structure", error });
    }
};
const updateExamFee = async (req, res) => {
    try {
        const updatedFee = await ExamFee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedFee);
    } catch (error) {
        res.status(400).json({ message: "Error updating exam fee structure", error });
    }
};


module.exports = {
    createAdmission,
    getAllAdmissions,
    updateAdmission,
    deleteAdmission,
    createExamFee,
    getAllExamFees,
    deleteExamFee,
    updateExamFee
};