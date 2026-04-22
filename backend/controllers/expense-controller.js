const Expense = require('../models/expenseSchema.js');

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
        let expenses = await Expense.find({ school: req.params.id }).sort({ date: -1 });
        if (expenses.length > 0) {
            res.send(expenses);
        } else {
            res.send({ message: "No expenses found" });
        }
    } catch (err) {
        res.status(500).json(err);
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