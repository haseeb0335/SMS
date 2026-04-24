const router = require('express').Router();

 const { adminRegister, adminLogIn, deleteAdmin, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');
const { addSalary, getTeacherSalaries, getAllSalaries, deleteSalary,editSalary } = require('../controllers/salary-controller.js');
// const { adminRegister, adminLogIn, getAdminDetail} = require('../controllers/admin-controller.js');
const { getStudentAnalytics, parentRegister, parentLogIn, applyLeave, approveLeave, getParentByStudent, getParentDetail, updateLeave, deleteLeave,} = require('../controllers/parent-controller.js');
const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require('../controllers/class-controller.js');
const { complainCreate, complainList, complainDelete, } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
    studentRegister,
    studentLogIn,
    getStudentProfileDetailed,
    getStudents,
    getStudentDetail,
    getClassStudentsWithAttendance,
    deleteStudents,
    deleteStudent,
     removeStudentMark,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    deleteSingleAttendance,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    createQuiz,
    getQuizByClass,
    submitQuiz,
    deleteQuiz,
    updateQuiz,
    getClassStudents,
    deleteStudentQuizResult,
    removeStudentAttendance } = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeachersByClass, getTeacherAttendance,  getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance,updateTeacher,deleteTeacherAttendance,removeTeacherAttendance, } = require('../controllers/teacher-controller.js');
const { addFees, getStudentFees,getAllFees, deleteFee, editFee } = require("../controllers/Fees-controller.js");
const { addExpense, getExpenses, deleteExpense, updateExpense } = require('../controllers/expense-controller.js');
const { askAI } = require('../controllers/ai-controller.js');

const { createAdmission, getAllAdmissions, updateAdmission, deleteAdmission, createExamFee, getAllExamFees, updateExamFee, deleteExamFee, } = require('../controllers/admissionController.js');

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.get("/Admin/:id", getAdminDetail)
router.delete("/Admin/:id", deleteAdmin)
router.put("/Admin/:id", updateAdmin)

// Admission Fees
router.post('/AdmissionFees', createAdmission);
router.get('/Admissions', getAllAdmissions);
router.put('/Admission/:id', updateAdmission);
router.delete('/Admission/:id', deleteAdmission);

// Exam Fees
router.post('/ExamFees', createExamFee);
router.get('/ExamFees', getAllExamFees);
router.put('/ExamFee/:id', updateExamFee);
 router.delete('/ExamFee/:id', deleteExamFee);

//  fee tracking
// router.get('/ClassWiseTracker/:id', getClassWiseTracker);
// router.get('/FeeStats', getFeeStats);


// AI Route
router.post('/AskAI', askAI);

// Parents route
router.get("/StudentAnalytics/:id", getStudentAnalytics);
router.post('/ParentReg', parentRegister);
router.post('/ParentLogin', parentLogIn);
router.post('/ApplyLeave', applyLeave);
router.get("/Parent/:id", getParentDetail);
router.put("/UpdateLeave/:parentId/:leaveId", updateLeave);
router.delete("/DeleteLeave/:parentId/:leaveId", deleteLeave);
router.put("/ApproveLeave/:parentId/:leaveId", approveLeave);
router.get("/ParentByStudent/:id", getParentByStudent);

// fees section
router.post("/AddFees", addFees);
router.get("/StudentFees/:id", getStudentFees);
router.get("/AllFees", getAllFees); 
router.put("/DeleteFee/:id", deleteFee);
router.put("/EditFee/:id", editFee);

// router.get("/Sclasses", getSclasses);

// Salary Routes
router.post("/AddSalary", addSalary);
router.get("/TeacherSalaries/:id", getTeacherSalaries);
router.get("/AllSalaries/:id", getAllSalaries);
router.delete("/DeleteSalary/:id", deleteSalary); 
router.put("/EditSalary/:id", editSalary);

// expense 
router.post('/ExpenseCreate', addExpense);
router.get('/ExpenseList/:id', getExpenses); // :id is the Admin/School ID
router.delete('/ExpenseDelete/:id', deleteExpense);
router.put('/ExpenseUpdate/:id', updateExpense);


// Student
router.delete("/deleteQuiz/:id", deleteQuiz);
router.get("/Sclass/Students/:id", getClassStudents);
router.get('/StudentProfile/:id', getStudentProfileDetailed);

router.get("/Sclass/StudentsAttendance/:id", getClassStudentsWithAttendance);

router.put("/updateQuiz/:id", updateQuiz);

router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)

router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)

router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)

router.put("/Student/:id", updateStudent)
router.put('/RemoveStudentMark/:id', removeStudentMark);

router.put('/UpdateExamResult/:id', updateExamResult)

router.put('/StudentAttendance/:id', studentAttendance)

router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance);
router.delete('/DeleteStudentAttendance/:studentId/:attendanceId', deleteSingleAttendance);

router.post("/createQuiz", createQuiz);
router.get("/getQuiz/:className", getQuizByClass);
router.post("/submitQuiz", submitQuiz);
router.delete("/deleteQuizResult/:studentId/:resultId", deleteStudentQuizResult);

// Teacher
router.delete('/DeleteTeacherAttendance/:teacherId/:attenId', deleteTeacherAttendance)
router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)

router.get('/TeacherAttendance/:id', getTeacherAttendance);

router.get("/Teachers/:id", getTeachers)
router.get("/TeachersClass/:id", getTeachersByClass)
router.get("/Teacher/:id", getTeacherDetail)

router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)

router.put("/TeacherSubject", updateTeacherSubject)

router.post('/TeacherAttendance/:id', teacherAttendance)
router.put("/Teacher/:id", updateTeacher)
router.put("/RemoveTeacherAtten/:id", removeTeacherAttendance);



// Notice

router.post('/NoticeCreate', noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)

router.put("/Notice/:id", updateNotice)

// Complain

router.post('/ComplainCreate', complainCreate);

router.get('/ComplainList/:id', complainList);

router.delete('/ComplainDelete/:id', complainDelete);

// Sclass

router.post('/SclassCreate', sclassCreate);

router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)

router.get("/Sclass/Students/:id", getSclassStudents)

router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject

router.post('/SubjectCreate', subjectCreate);

router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

module.exports = router;