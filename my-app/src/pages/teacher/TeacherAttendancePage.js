import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    Box, Typography, Table, TableRow, TableCell, TableBody,
    Paper, Checkbox, Button, TextField, MenuItem,
    Snackbar, Alert, CircularProgress, IconButton, Tooltip,
    Card, Grid, Divider, Chip, Stack, Container,
    Accordion, AccordionSummary, AccordionDetails, TableContainer, TableHead
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
        <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
            {/* Header Section */}
            <Box mb={{ xs: 3, md: 5 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h3" fontWeight="900" sx={{ color: '#1e293b', letterSpacing: '-1.5px', fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>
                    Attendance Hub
                </Typography>
                <Typography variant="h6" color="textSecondary" fontWeight="500" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }, mt: 0.5 }}>
                    Precision tracking for your academic sessions.
                </Typography>
            </Box>

            <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
                {/* Marking Attendance Section */}
                <Grid item xs={12} sm={10} md={8} lg={4}>
                    <Card 
                        sx={{ 
                            p: { xs: 2.5, sm: 3, md: 4 }, 
                            borderRadius: '24px', 
                            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.06)', 
                            position: { lg: 'sticky' }, 
                            top: 24,
                            mx: 'auto',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    >
                        <Stack spacing={3}>
                            <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', lg: 'flex-start' }} gap={2}>
                                <Box sx={{ bgcolor: 'primary.main', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)' }}>
                                    <FactCheckIcon fontSize="small" />
                                </Box>
                                <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>New Entry</Typography>
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
                                sx={{ py: { xs: 1.5, md: 2 }, textTransform: 'none', fontWeight: '800', borderRadius: '14px', fontSize: '0.95rem', boxShadow: '0 8px 20px rgba(25, 118, 210, 0.25)' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Finalize Attendance"}
                            </Button>
                        </Stack>

                        {students.length > 0 && (
                            <Box mt={4}>
                                <Divider sx={{ mb: 2.5 }}>
                                    <Chip label="Student List" size="small" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} />
                                </Divider>
                                <TableContainer sx={{ maxHeight: 350, maxWidth: '100%', overflowX: 'auto', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: '800', bgcolor: '#f8fafc', py: 1.5 }}>Roll</TableCell>
                                                <TableCell sx={{ fontWeight: '800', bgcolor: '#f8fafc', py: 1.5 }}>Name</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: '800', bgcolor: '#f8fafc', py: 1.5 }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {students.map((student) => (
                                                <TableRow key={student._id} hover>
                                                    <TableCell sx={{ py: 1 }}>{student.rollNum}</TableCell>
                                                    <TableCell sx={{ fontWeight: '600', py: 1 }}>{student.name}</TableCell>
                                                    <TableCell align="center" sx={{ py: 0.5 }}>
                                                        <Checkbox 
                                                            checked={attendance[student._id] || false} 
                                                            onChange={() => setAttendance(prev => ({ ...prev, [student._id]: !prev[student._id] }))} 
                                                            sx={{ color: '#cbd5e1', p: 1, '&.Mui-checked': { color: '#10b981' } }}
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
                    <Card sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: '24px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.03)', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} gap={2} mb={4}>
                            <Box sx={{ bgcolor: 'secondary.main', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <HistoryEduIcon fontSize="small" />
                            </Box>
                            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography variant="h6" fontWeight="800" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>Attendance Archives</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>Manage previous records by class and month</Typography>
                            </Box>
                        </Box>

                        {sortedClassNames.length === 0 && !loading && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="textDisabled" fontWeight="600" sx={{ fontSize: '1rem' }}>No historical data available</Typography>
                            </Box>
                        )}

                        {sortedClassNames.map((className) => (
                            <Accordion key={className} sx={{ mb: 2, borderRadius: '16px !important', overflow: 'hidden', '&:before': { display: 'none' }, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Typography fontWeight="800" variant="h6" sx={{ color: '#334155', fontSize: '1rem' }}> {className}</Typography>
                                        <Chip label={`${Object.keys(classGroups[className]).length} Months`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                    </Stack>
                                </AccordionSummary>
                                <AccordionSummaryDetails sx={{ p: 0 }}>
                                    {Object.keys(classGroups[className]).map((month) => (
                                        <Accordion key={month} variant="outlined" sx={{ m: { xs: 1.5, sm: 2 }, borderRadius: '12px !important', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <CalendarMonthIcon fontSize="small" color="action" />
                                                    <Typography fontWeight="700" variant="subtitle2" sx={{ fontSize: '0.9rem' }}>{month}</Typography>
                                                </Stack>
                                            </AccordionSummary>
                                            <AccordionSummaryDetails sx={{ p: 0 }}>
                                                <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                                                    <Table size="small">
                                                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: '700', py: 1.5 }}>Date</TableCell>
                                                                <TableCell sx={{ fontWeight: '700', py: 1.5 }}>Student</TableCell>
                                                                <TableCell sx={{ fontWeight: '700', py: 1.5 }}>Status</TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: '700', py: 1.5 }}>Actions</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {classGroups[className][month].map((rec, i) => {
                                                                const isEditing = editMode === rec.attRecord._id;
                                                                const isPresent = rec.attRecord.status === "Present";
                                                                const isDeleting = deleteLoading === rec.attRecord._id;

                                                                return (
                                                                    <TableRow key={i} hover>
                                                                        <TableCell sx={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', py: 1.5 }}>
                                                                            {new Date(rec.attRecord.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                                        </TableCell>
                                                                        <TableCell sx={{ py: 1 }}>
                                                                            <Typography variant="body2" fontWeight="700" sx={{ fontSize: '0.85rem' }}>{rec.name}</Typography>
                                                                            <Typography variant="caption" color="textDisabled" display="block" sx={{ lineHeight: 1 }}>Roll: {rec.rollNum}</Typography>
                                                                        </TableCell>
                                                                        <TableCell sx={{ py: 1 }}>
                                                                            {isEditing ? (
                                                                                <TextField select size="small" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} sx={{ width: 95, '& .MuiOutlinedInput-input': { py: 0.5, fontSize: '0.85rem' } }}>
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
                                                                                        fontSize: '0.65rem',
                                                                                        height: 20
                                                                                    }} 
                                                                                />
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell align="right" sx={{ py: 1 }}>
                                                                            {isEditing ? (
                                                                                <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                                                                                    <IconButton size="small" onClick={() => handleUpdate(rec._id, rec.attRecord.date)} color="success"><SaveIcon fontSize="small"/></IconButton>
                                                                                    <IconButton size="small" onClick={() => setEditMode(null)} color="error"><CancelIcon fontSize="small"/></IconButton>
                                                                                </Stack>
                                                                            ) : (
                                                                                <Stack direction="row" spacing={0.25} justifyContent="flex-end">
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
                                            </AccordionSummaryDetails>
                                        </Accordion>
                                    ))}
                                </AccordionSummaryDetails>
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

// Named fallback to keep compliance clean across old material packages setup
const AccordionSummaryDetails = AccordionDetails;

export default TeacherAttendancePage;