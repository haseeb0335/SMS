import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Checkbox, Button, TextField, MenuItem,
    Snackbar, Alert, CircularProgress, IconButton, Tooltip,
    Card, Grid, Divider, Chip, Stack, Container,
    Accordion, AccordionSummary, AccordionDetails, TableContainer
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://sms-xi-rose.vercel.app";


function TeacherAttendancePage() {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceFeed, setAttendanceFeed] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [attendance, setAttendance] = useState({});
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    
    const [editMode, setEditMode] = useState(null);
    const [editStatus, setEditStatus] = useState("");

    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info"
    });

    const user = JSON.parse(localStorage.getItem("user")) ||
                  JSON.parse(localStorage.getItem("teacherDetails"));

    const schoolId = user?.school?._id || user?.school;
    const subjectId = user?.teachSubject?._id || user?.teachSubject;

    const fetchAllStudents = useCallback(async (classData) => {
        try {
            const studentPromises = classData.map(async (cls) => {
                const res = await axios.get(`${BASE_URL}/Sclass/StudentsAttendance/${cls._id}`);
                if (Array.isArray(res.data)) {
                    return res.data.map(student => ({
                        ...student,
                        displayClassName: cls.sclassName
                    }));
                }
                return [];
            });
            const results = await Promise.all(studentPromises);
            setAttendanceFeed(results.flat());
        } catch (err) {
            console.error("Error fetching all students:", err);
        }
    }, []);

    const fetchClasses = useCallback(async () => {
        if (!schoolId) return;
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);
            const sortedClasses = (res.data || []).sort((a, b) =>
                a.sclassName.localeCompare(b.sclassName, undefined, { numeric: true })
            );
            setClasses(sortedClasses);
            await fetchAllStudents(sortedClasses);
        } catch (err) {
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    }, [schoolId, fetchAllStudents]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const fetchStudentsByClass = async (classId) => {
        try {
            const res = await axios.get(`${BASE_URL}/Sclass/StudentsAttendance/${classId}`);
            const sortedStudents = (res.data || []).sort((a, b) => a.rollNum - b.rollNum);
            setStudents(sortedStudents);
            const initialAttendance = {};
            sortedStudents.forEach((s) => (initialAttendance[s._id] = true));
            setAttendance(initialAttendance);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!selectedClass || !date) {
            setNotification({ open: true, message: "Please select class and date", severity: "warning" });
            return;
        }
        try {
            setLoading(true);
            await Promise.all(
                students.map(async (student) => {
                    const data = {
                        date: new Date(date),
                        status: attendance[student._id] ? "Present" : "Absent",
                        subName: subjectId
                    };
                    await axios.put(`${BASE_URL}/StudentAttendance/${student._id}`, data);
                })
            );
            setNotification({ open: true, message: "Attendance Saved Successfully", severity: "success" });
            fetchClasses();
            setDate("");
        } catch (err) {
            setNotification({ open: true, message: "Error saving attendance", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (studentId, attendanceId) => {
        try {
            setDeleteLoading(attendanceId);
            await axios.delete(`${BASE_URL}/DeleteStudentAttendance/${studentId}/${attendanceId}`);
            setNotification({ open: true, message: "Record deleted", severity: "success" });
            fetchClasses(); 
        } catch (err) {
            console.error("Delete Error:", err);
            setNotification({ open: true, message: "Delete failed", severity: "error" });
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleUpdate = async (studentId, originalDate) => {
        try {
            const data = {
                date: originalDate,
                status: editStatus,
                subName: subjectId
            };
            await axios.put(`${BASE_URL}/StudentAttendance/${studentId}`, data);
            setNotification({ open: true, message: "Record updated", severity: "success" });
            setEditMode(null);
            fetchClasses();
        } catch (err) {
            setNotification({ open: true, message: "Update failed", severity: "error" });
        }
    };

    const classGroups = {};
    attendanceFeed.forEach((student) => {
        const className = student.displayClassName;
        if (!className || !student.attendance) return;
        student.attendance.forEach((att) => {
            if (att.subName?.toString() === subjectId?.toString()) {
                const monthName = new Date(att.date).toLocaleString("default", { month: "long", year: "numeric" });
                if (!classGroups[className]) classGroups[className] = {};
                if (!classGroups[className][monthName]) classGroups[className][monthName] = [];
                classGroups[className][monthName].push({ ...student, attRecord: att });
            }
        });
    });

    const sortedClassNames = Object.keys(classGroups).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header Section */}
            <Box mb={5} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h3" fontWeight="900" sx={{ color: '#1e293b', letterSpacing: '-1.5px' }}>
                    Attendance Hub
                </Typography>
                <Typography variant="h6" color="textSecondary" fontWeight="500">
                    Precision tracking for your academic sessions.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Marking Attendance Section */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ p: 4, borderRadius: '24px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', position: 'sticky', top: 24 }}>
                        <Stack spacing={4}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box sx={{ bgcolor: 'primary.main', width: 48, height: 48, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <FactCheckIcon />
                                </Box>
                                <Typography variant="h6" fontWeight="800">New Entry</Typography>
                            </Box>
                            
                            <TextField 
                                select 
                                fullWidth
                                label="Select Class" 
                                value={selectedClass} 
                                onChange={(e) => { setSelectedClass(e.target.value); fetchStudentsByClass(e.target.value); }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }}}
                            >
                                {classes.map((cls) => (<MenuItem key={cls._id} value={cls._id}>{cls.sclassName}</MenuItem>))}
                            </TextField>

                            <TextField 
                                fullWidth
                                type="date" 
                                label="Attendance Date" 
                                InputLabelProps={{ shrink: true }} 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' }}}
                            />

                            <Button 
                                variant="contained" 
                                fullWidth 
                                size="large"
                                onClick={handleSave} 
                                disabled={loading || students.length === 0}
                                sx={{ py: 2, textTransform: 'none', fontWeight: '800', borderRadius: '14px', fontSize: '1rem', boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Finalize Attendance"}
                            </Button>
                        </Stack>

                        {students.length > 0 && (
                            <Box mt={5}>
                                <Divider sx={{ mb: 3 }}>
                                    <Chip label="Student List" size="small" sx={{ fontWeight: 'bold' }} />
                                </Divider>
                                <TableContainer sx={{ maxHeight: 400 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: '800', borderBottom: '2px solid #f1f5f9' }}>Roll</TableCell>
                                                <TableCell sx={{ fontWeight: '800', borderBottom: '2px solid #f1f5f9' }}>Name</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: '800', borderBottom: '2px solid #f1f5f9' }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {students.map((student) => (
                                                <TableRow key={student._id} hover>
                                                    <TableCell>{student.rollNum}</TableCell>
                                                    <TableCell fontWeight="500">{student.name}</TableCell>
                                                    <TableCell align="center">
                                                        <Checkbox 
                                                            checked={attendance[student._id] || false} 
                                                            onChange={() => setAttendance(prev => ({ ...prev, [student._id]: !prev[student._id] }))} 
                                                            sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#10b981' } }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}
                    </Card>
                </Grid>

                {/* History Section with Dropdowns */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ p: 4, borderRadius: '24px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Box display="flex" alignItems="center" gap={2} mb={4}>
                            <Box sx={{ bgcolor: 'secondary.main', width: 48, height: 48, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <HistoryEduIcon />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight="800">Attendance Archives</Typography>
                                <Typography variant="body2" color="textSecondary">Manage previous records by class and month</Typography>
                            </Box>
                        </Box>

                        {sortedClassNames.length === 0 && !loading && (
                            <Box sx={{ textAlign: 'center', py: 10 }}>
                                <Typography variant="h6" color="textDisabled">No historical data available</Typography>
                            </Box>
                        )}

                        {sortedClassNames.map((className) => (
                            <Accordion key={className} sx={{ mb: 2, borderRadius: '16px !important', overflow: 'hidden', '&:before': { display: 'none' }, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Typography fontWeight="800" variant="h6" sx={{ color: '#334155' }}>Class {className}</Typography>
                                        <Chip label={`${Object.keys(classGroups[className]).length} Months`} size="small" variant="outlined" />
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    {Object.keys(classGroups[className]).map((month) => (
                                        <Accordion key={month} variant="outlined" sx={{ m: 2, borderRadius: '12px !important', border: '1px solid #e2e8f0' }}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <CalendarMonthIcon fontSize="small" color="action" />
                                                    <Typography fontWeight="700" variant="subtitle1">{month}</Typography>
                                                </Stack>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ p: 0 }}>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: '700' }}>Date</TableCell>
                                                                <TableCell sx={{ fontWeight: '700' }}>Student</TableCell>
                                                                <TableCell sx={{ fontWeight: '700' }}>Status</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: '700' }}>Actions</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {classGroups[className][month].map((rec, i) => {
                                                                const isEditing = editMode === rec.attRecord._id;
                                                                const isPresent = rec.attRecord.status === "Present";
                                                                const isDeleting = deleteLoading === rec.attRecord._id;

                                                                return (
                                                                    <TableRow key={i} hover>
                                                                        <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                                            {new Date(rec.attRecord.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                                        </TableCell>
                                                                        <TableCell sx={{ fontWeight: '600' }}>
                                                                            <Typography variant="body2" fontWeight="700">{rec.name}</Typography>
                                                                            <Typography variant="caption" color="textDisabled">Roll: {rec.rollNum}</Typography>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {isEditing ? (
                                                                                <TextField select size="small" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} sx={{ width: 100 }}>
                                                                                    <MenuItem value="Present">Present</MenuItem>
                                                                                    <MenuItem value="Absent">Absent</MenuItem>
                                                                                </TextField>
                                                                            ) : (
                                                                                <Chip 
                                                                                    label={rec.attRecord.status} 
                                                                                    size="small" 
                                                                                    sx={{ 
                                                                                        bgcolor: isPresent ? '#dcfce7' : '#fee2e2', 
                                                                                        color: isPresent ? '#166534' : '#991b1b',
                                                                                        fontWeight: '800',
                                                                                        borderRadius: '8px',
                                                                                        fontSize: '0.7rem'
                                                                                    }} 
                                                                                />
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            {isEditing ? (
                                                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                                                    <IconButton size="small" onClick={() => handleUpdate(rec._id, rec.attRecord.date)} color="success"><SaveIcon fontSize="small"/></IconButton>
                                                                                    <IconButton size="small" onClick={() => setEditMode(null)} color="error"><CancelIcon fontSize="small"/></IconButton>
                                                                                </Stack>
                                                                            ) : (
                                                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                                                    <Tooltip title="Edit Record"><IconButton size="small" onClick={() => { setEditMode(rec.attRecord._id); setEditStatus(rec.attRecord.status); }} sx={{ color: '#64748b' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                                                    <Tooltip title="Delete Permanently">
                                                                                        <IconButton 
                                                                                            size="small" 
                                                                                            onClick={() => handleDelete(rec._id, rec.attRecord._id)} 
                                                                                            sx={{ color: '#fda4af' }}
                                                                                            disabled={isDeleting}
                                                                                        >
                                                                                            {isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon fontSize="small" />}
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                </Stack>
                                                                            )}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Card>
                </Grid>
            </Grid>

            <Snackbar 
                open={notification.open} 
                autoHideDuration={4000} 
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={notification.severity} variant="filled" sx={{ width: '100%', borderRadius: '14px', fontWeight: '700' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default TeacherAttendancePage;