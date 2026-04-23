const Admission = require('../models/Admission');

// GET all admissions
exports.getAllAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find().sort({ createdAt: -1 });
        res.status(200).json(admissions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
};

// POST new admission
exports.createAdmission = async (req, res) => {
    try {
        const newAdmission = new Admission(req.body);
        const savedAdmission = await newAdmission.save();
        res.status(201).json(savedAdmission);
    } catch (error) {
        res.status(400).json({ message: "Error saving admission", error });
    }
};

// PUT (Update) admission
exports.updateAdmission = async (req, res) => {
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

// DELETE admission
exports.deleteAdmission = async (req, res) => {
    try {
        await Admission.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting record", error });
    }
};