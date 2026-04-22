const Expense = require('../models/expenseSchema.js');
const mongoose = require('mongoose');

const addExpense = async (req, res) => {
    try {
        const expense = new Expense({
            ...req.body,
            school: req.body.adminID // Assuming you pass adminID from frontend
        });
        const result = await expense.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getExpenses = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the ID is a valid MongoDB ObjectId to prevent 500 crash
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Admin ID format" });
        }

        let expenses = await Expense.find({ school: id }).sort({ date: -1 });
        res.send(expenses);
    } catch (err) {
        console.error(err); // This will show the real error in your Vercel logs
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

const updateExpense = async (req, res) => {
    try {
        const result = await Expense.findByIdAndUpdate(req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};


const deleteExpense = async (req, res) => {
    try {
        const result = await Expense.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};


// Add to exports
module.exports = { addExpense, getExpenses, deleteExpense, updateExpense };