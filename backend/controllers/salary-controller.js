import Salary from "../models/salarySchema.js";

// Admin adds salary
export const addSalary = async (req, res) => {
    try {
        const salary = new Salary(req.body);
        const result = await salary.save();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Teacher gets their own salary history
export const getTeacherSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find({ teacherId: req.params.id }).sort({ date: -1 });
        res.status(200).json(salaries);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Admin gets all salaries for their school
export const getAllSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find({ schoolId: req.params.id });
        res.status(200).json(salaries);
    } catch (err) {
        res.status(500).json(err);
    }
};
// backend/controllers/salary-controller.js
export const deleteSalary = async (req, res) => {
    try {
        await Salary.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
};

export const editSalary = async (req, res) => {
    try {
        const result = await Salary.findByIdAndUpdate(req.params.id, 
            { $set: req.body }, { new: true });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json(err);
    }
};