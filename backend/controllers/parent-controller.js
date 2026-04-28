// FIX: Changed path from student_controller.js to studentSchema.js
import { Student } from "../models/studentSchema.js";
import Parent from "../models/parentSchema.js";
import bcrypt from "bcrypt";

export const parentRegister = async (req, res) => {
    try {
        const { name, email, password, role, school, studentId } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const parent = new Parent({ name, email, password: hashedPass, role, school, studentId });

        const existingParent = await Parent.findOne({ email });
        if (existingParent) {
            return res.send({ message: 'Email already exists' });
        } else {
            let result = await parent.save();
            result.password = undefined;
            return res.send(result);
        }
    } catch (err) {
        return res.status(500).json(err);
    }
};

export const parentLogIn = async (req, res) => {
    try {
        let parent = await Parent.findOne({ email: req.body.email });
        if (parent) {
            const validated = await bcrypt.compare(req.body.password, parent.password);
            if (validated) {
                parent.password = undefined;
                return res.send(parent);
            } else {
                return res.send({ message: "Invalid password" });
            }
        } else {
            return res.send({ message: "Parent not found" });
        }
    } catch (err) {
        return res.status(500).json(err);
    }
};

export const getStudentAnalytics = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Use a fallback to handle different export types from studentSchema.js
        const StudentModel = Student.default || Student;

        // Fetch student data
        const student = await StudentModel.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Attendance Calculation
        const attendance = student.attendance || [];
        const presentCount = attendance.filter(a => a.status === 'Present').length;
        const totalSessions = attendance.length;
        const attendancePercentage = totalSessions > 0 
            ? ((presentCount / totalSessions) * 100).toFixed(2) 
            : 0;

        const report = {
            details: {
                name: student.name,
                rollNum: student.rollNum,
                className: student.sclass || "Not Assigned", 
            },
            attendance: attendance,
            examResult: student.examResult || [],
            overallAttendance: attendancePercentage
        };

        return res.status(200).json(report);
    } catch (err) {
        console.error("Analytics Error:", err.message);
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};
export const applyLeave = async (req, res) => {
    try {
        // We need the Parent's ID to update the parent record
        const { parentId, leaveDate, leaveReason } = req.body;

        const result = await Parent.findByIdAndUpdate(
            parentId,
            {
                $push: {
                    leaves: {
                        leaveDate: leaveDate,
                        leaveReason: leaveReason,
                        status: "Pending"
                    }
                }
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Parent not found" });
        }

        return res.status(200).json({ message: "Leave applied successfully", result });
    } catch (err) {
        return res.status(500).json({ message: "Error applying leave", error: err.message });
    }
};
// Example of what your detail controller should look like:
export const getParentDetail = async (req, res) => {
    try {
        // Try to find the user in the Parent collection
        let parent = await Parent.findById(req.params.id);
        
        if (parent) {
            parent.password = undefined; // Security
            return res.send(parent); // This will now include the 'leaves' array
        } else {
            return res.status(404).json({ message: "No parent found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};
// DELETE Leave
export const deleteLeave = async (req, res) => {
    try {
        const { parentId, leaveId } = req.params;
        const result = await Parent.findByIdAndUpdate(
            parentId,
            { $pull: { leaves: { _id: leaveId } } },
            { new: true }
        );
        res.status(200).json(result.leaves);
    } catch (err) {
        res.status(500).json(err);
    }
};

// EDIT Leave
export const updateLeave = async (req, res) => {
    try {
        const { parentId, leaveId } = req.params;
        const { leaveDate, leaveReason } = req.body;

        const result = await Parent.findOneAndUpdate(
            { _id: parentId, "leaves._id": leaveId },
            {
                $set: {
                    "leaves.$.leaveDate": leaveDate,
                    "leaves.$.leaveReason": leaveReason
                }
            },
            { new: true }
        );
        res.status(200).json(result.leaves);
    } catch (err) {
        res.status(500).json(err);
    }
};

// parent-controller.js

export const getParentByStudent = async (req, res) => {
    try {
        // Find the parent where the studentId field matches the ID from the URL
        const parent = await Parent.findOne({ studentId: req.params.id });
        
        if (parent) {
            // Return the whole parent object (which includes the 'leaves' array)
            res.status(200).json(parent);
        } else {
            res.status(404).json({ message: "No parent linked to this student" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching parent data", error: err });
    }
};
// parent-controller.js

export const approveLeave = async (req, res) => {
    try {
        const { parentId, leaveId } = req.params;

        const result = await Parent.findOneAndUpdate(
            { _id: parentId, "leaves._id": leaveId },
            {
                $set: { "leaves.$.status": "Approved" }
            },
            { new: true }
        );

        res.status(200).json({ message: "Leave Approved", leaves: result.leaves });
    } catch (err) {
        res.status(500).json(err);
    }
};