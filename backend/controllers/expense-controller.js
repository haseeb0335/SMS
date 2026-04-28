import Expense from '../models/expenseSchema.js';
import mongoose from 'mongoose';

// ✅ Added 'export const' to each function for consistency
export const addExpense = async (req, res) => {
    try {
        const expense = new Expense({
            ...req.body,
            school: req.body.adminID 
        });
        const result = await expense.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getExpenses = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Admin ID format" });
        }

        let expenses = await Expense.find({ school: id }).sort({ date: -1 });
        res.send(expenses);
    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export const updateExpense = async (req, res) => {
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

export const deleteExpense = async (req, res) => {
    try {
        const result = await Expense.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};