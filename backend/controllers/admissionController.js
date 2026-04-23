const Admission = require('../models/Admission');

// POST /AdmissionFees
// Triggered when submitting the form to register a new student
export const createAdmission = async (req, res) => {
    try {
        const newAdmission = new Admission(req.body);
        const savedAdmission = await newAdmission.save();
        res.status(201).json(savedAdmission);
    } catch (error) {
        res.status(400).json({ message: "Error saving admission record", error });
    }
};

// GET /Admissions
// Triggered when the component loads to fetch all records
export const getAllAdmissions = async (req, res) => {
    try {
        const admissions = await Admission.find().sort({ createdAt: -1 });
        res.status(200).json(admissions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admissions", error });
    }
};

// PUT /Admission/:id
// Triggered when updating an existing student's details
export const updateAdmission = async (req, res) => {
    try {
        const updatedAdmission = await Admission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Returns the updated document instead of the old one
        );
        res.status(200).json(updatedAdmission);
    } catch (error) {
        res.status(400).json({ message: "Error updating record", error });
    }
};

// DELETE /Admission/:id
// Triggered when removing a student from the system
export const deleteAdmission = async (req, res) => {
    try {
        await Admission.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Admission record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting record", error });
    }
};