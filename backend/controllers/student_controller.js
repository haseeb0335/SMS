const bcrypt = require('bcrypt');
// Destructure both Student and Quiz from your schema file
const { Student, Quiz } = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');

const studentRegister = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingStudent = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
        });

        if (existingStudent) {
            res.send({ message: 'Roll Number already exists' });
        }
        else {
            const student = new Student({
                ...req.body,
                school: req.body.adminID,
                password: hashedPass
            });

            let result = await student.save();
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};
const getClassStudents = async (req, res) => {
    try {
        const students = await Student.find({ sclassName: req.params.id });
        if (students.length > 0) {
            const modifiedStudents = students.map((student) => {
                const sortedResults = student.quizResults.sort((a, b) => b.score - a.score);
                return { 
                    _id: student._id,
                    name: student.name,
                    rollNum: student.rollNum,
                    quizResults: sortedResults 
                };
            });
            modifiedStudents.sort((a, b) => {
                const maxA = a.quizResults.length > 0 ? Math.max(...a.quizResults.map(r => r.score)) : 0;
                const maxB = b.quizResults.length > 0 ? Math.max(...b.quizResults.map(r => r.score)) : 0;
                return maxB - maxA;
            });
            res.send(modifiedStudents);
        } else {
            res.send([]);
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching class students", error: err });
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id)
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const removeStudentMark = async (req, res) => {
    try {
        const { subId } = req.body;
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });

        student.examResult = student.examResult.filter(
            (item) => item.subName.toString() !== subId
        );
        await student.save();
        res.status(200).json({ message: "Mark removed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id })
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id })
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            req.body.password = await bcrypt.hash(req.body.password, salt)
        }
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.send({ message: 'Student not found' });

        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.send({ message: 'Student not found' });

        const subject = await Subject.findById(subName);
        const existingAttendance = student.attendance.find(
            (a) => a.date.toDateString() === new Date(date).toDateString() && a.subName.toString() === subName
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            const attendedSessions = student.attendance.filter((a) => a.subName.toString() === subName).length;
            if (attendedSessions >= subject.sessions) {
                return res.send({ message: 'Maximum attendance limit reached' });
            }
            student.attendance.push({ date, status, subName });
        }
        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;
    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id
    try {
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId
    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;
    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteSingleAttendance = async (req, res) => {
    const { studentId, attendanceId } = req.params;
    try {
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).send({ message: "Student not found" });

        student.attendance = student.attendance.filter((att) => att._id.toString() !== attendanceId);
        await student.save();
        res.send({ message: "Attendance deleted successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
};

// ================= QUIZ CONTROLLERS (UPDATED TO MONGO) =================

// Teacher creates quiz
const createQuiz = async (req, res) => {
    try {
        const { title, className, questions } = req.body;
        const quiz = new Quiz({ title, className, questions, date: new Date() });
        const result = await quiz.save();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get quiz for students OR for teacher portal list
const getQuizByClass = async (req, res) => {
    try {
        const classQuizzes = await Quiz.find({ className: req.params.className });
        res.send(classQuizzes);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const result = await Quiz.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const updateQuiz = async (req, res) => {
    try {
        const result = await Quiz.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const submitQuiz = async (req, res) => {
    try {
        const { studentId, quizId, answers } = req.body;
        
        // Find Quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        // Calculate Score
        let score = 0;
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) {
                score++;
            }
        });

        // Find Student
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        // Push results to Student Schema
        student.quizResults.push({
            quizTitle: quiz.title,
            score: score,
            total: quiz.questions.length,
            date: new Date()
        });

        await student.save();
        
        // Send simplified response for frontend logic
        res.status(200).json({ 
            score, 
            total: quiz.questions.length,
            quizTitle: quiz.title 
        });
    } catch (error) {
        console.error("Backend Submit Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const deleteStudentQuizResult = async (req, res) => {
    try {
        const { studentId, resultId } = req.params;

        // Find student and pull the specific result from the array using its _id
        const result = await Student.findByIdAndUpdate(
            studentId,
            { $pull: { quizResults: { _id: resultId } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting record", error: error.message });
    }
};
const getClassStudentsWithAttendance = async (req, res) => {
    try {
        const students = await Student.find({ sclassName: req.params.id });

        if (!students) {
            return res.send([]);
        }

        const formattedStudents = students.map((student) => ({
            _id: student._id,
            name: student.name,
            rollNum: student.rollNum,
            attendance: student.attendance
        }));

        res.send(formattedStudents);

    } catch (error) {
        res.status(500).json({ message: "Error fetching attendance data", error });
    }
};

// NEW: Dedicated controller for the Profile Page
const getStudentProfileDetailed = async (req, res) => {
    try {
        // We fetch the student and use .lean() to get a plain JS object
        // We populate class and school to get the names
        const student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .lean();

        if (student) {
            // Remove sensitive data before sending to frontend
            const { password, ...studentData } = student;
            res.status(200).json(studentData);
        } else {
            res.status(404).json({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// Remember to add getStudentProfileDetailed to your module.exports at the bottom!

module.exports = {
    studentRegister,
    getStudentProfileDetailed,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    removeStudentMark,
    deleteSingleAttendance,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    submitQuiz,
    getQuizByClass,
    createQuiz,
    deleteQuiz,
    getClassStudents,
    deleteStudentQuizResult, 
    getClassStudentsWithAttendance,   
    updateQuiz
};