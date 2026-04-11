const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher'   // or 'admin' depending who logs complaint
    },

    complainer: {
        type: String,
        required: true
    },

    complaint: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    }

});

module.exports = mongoose.model("complain", complainSchema);