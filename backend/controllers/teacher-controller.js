import bcrypt from "bcrypt";
import Teacher from "../models/teacherSchema.js";
import Subject from '../models/subjectSchema.js';
import Sclass from '../models/sclassSchema.js'; // MUST BE HERE
import School from '../models/adminSchema.js';
import mongoose from 'mongoose';

export const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacher = new Teacher({ name, email, password: hashedPass, role, school, teachSubject, teachSclass });

        const existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else {
            let result = await teacher.save();
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getAllTeachers = async (req, res) => {
    try {
        console.log("School ID:", req.params.id);

        const teachers = await Teacher.find({
            school: req.params.id
        });

        console.log("Teachers Found:", teachers);

        res.status(200).json(teachers);

    } catch (err) {
        console.error("GET ALL TEACHERS ERROR:", err);
        res.status(500).json({
            message: "Server Error",
            error: err.message
        });
    }
};

export const getTeachersByClass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Class ID format" });
        }

        // We explicitly tell Mongoose to use the "sclass" model 
        // by passing it as an object if a string fails
        const teachers = await Teacher.find({ teachSclass: id })
            .populate({
                path: "teachSclass",
                model: "sclass", // Explicitly use the lowercase name from your schema
                select: "sclassName"
            })
            .populate({
                path: "teachSubject",
                model: "Subject", // Ensure this matches your subject schema name
                select: "subName"
            })
            .lean();

        if (!teachers) return res.status(200).json([]);

        const sanitizedTeachers = teachers.map(teacher => {
            const { password, ...details } = teacher;
            return details;
        });

        res.status(200).json(sanitizedTeachers);

    } catch (err) {
        console.error("SERVER CRASH DETAILS:", err); // Look at your terminal for this!
        res.status(500).json({ message: err.message });
    }
};

export const getTeacherDetail = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate({
        path: "teachSubject",
        model: "Subject" // Ensure subjectSchema uses mongoose.model("Subject",...)
      })
      .populate({
        path: "school",
        model: "Admin" // MATCHES YOUR adminSchema.js EXPORT (Capital A)
      })
      .populate({
        path: "teachSclass",
        model: "sclass" // MATCHES YOUR sclassSchema.js EXPORT (Lowercase s)
      });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const teacherData = teacher.toObject();
    teacherData.password = undefined;
    
    res.status(200).json(teacherData);

  } catch (err) {
    // Check your terminal for this message if it still fails!
    console.error("POPULATION ERROR:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        res.send(updatedTeacher);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        await Subject.updateOne(
            { teacher: deletedTeacher._id },
            { $unset: { teacher: 1 } }
        );

        res.send(deletedTeacher);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });
        if (deletionResult.deletedCount === 0) {
            return res.send({ message: "No teachers found to delete" });
        }

        await Subject.updateMany(
            { school: req.params.id },
            { $unset: { teacher: "" } }
        );

        res.send(deletionResult);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.name = req.body.name || teacher.name;
    teacher.email = req.body.email || teacher.email;
    teacher.schoolName = req.body.schoolName || teacher.schoolName;
    
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.body.profilePic) {
      teacher.profilePic = req.body.profilePic;
    }

    const updatedTeacher = await teacher.save();
    updatedTeacher.password = undefined;
    res.send(updatedTeacher);

  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ teachSclass: req.params.id });

        if (deletionResult.deletedCount === 0) {
            return res.send({ message: "No teachers found to delete" });
        }

        res.send(deletionResult);
    } catch (err) {
        res.status(500).json(err);
    }
};

export const getTeacherAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher.attendance || []);

  } catch (err) {
    res.status(500).json(err);
  }
};

export const removeTeacherAttendance = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { recordId } = req.body;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.attendance = teacher.attendance.filter(
      (rec) => rec._id.toString() !== recordId
    );

    await teacher.save();
    res.status(200).json({ message: "Attendance deleted successfully" });

  } catch (err) {
    res.status(500).json(err);
  }
};

export const teacherAttendance = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { date, status, location, time, reason } = req.body;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const attendanceData = {
      date: date ? new Date(date) : new Date(),
      time: time || null,
      status: status || "Present",
      reason: reason || null,
      location: location || null
    };

    teacher.attendance.push(attendanceData);
    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      attendance: teacher.attendance
    });

  } catch (err) {
    console.error("Teacher Attendance Error:", err);
    res.status(500).json({ message: "Server error while saving attendance" });
  }
};

export const deleteTeacherAttendance = async (req, res) => {
  try {
    const { teacherId, attenId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).send({ message: "Teacher not found" });

    teacher.attendance = teacher.attendance.filter(
      (att) => att._id.toString() !== attenId
    );

    await teacher.save();
    res.send({ message: "Attendance deleted" });

  } catch (err) {
    res.status(500).json(err);
  }
};

