const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Utilities', 'Salaries', 'Maintenance', 'Stationery', 'Events', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin', // Links expense to a specific school/admin
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("expense", expenseSchema);