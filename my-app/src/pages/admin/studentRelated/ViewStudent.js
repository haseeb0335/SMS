import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
    BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend 
} from 'recharts';

import { 
    Box, Button, IconButton, Table, TableBody, Typography, 
    Tab, Paper, BottomNavigation, BottomNavigationAction, Container, Grid, 
    Card, CardContent, CircularProgress, useTheme, Divider, Avatar, Stack,
    Chip, LinearProgress, TableContainer, TableHead, TableRow,
    TableCell, alpha // Added alpha for modern styling
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import { 
    Delete as DeleteIcon, Insights as InsightsIcon, TableChart as TableChartIcon, 
    AccountCircle, Class as ClassIcon, Fingerprint, School as SchoolIcon,
    Add as AddIcon, Edit as EditIcon, AssignmentTurnedIn as AssignmentTurnedInIcon,
    Download as DownloadIcon, History as HistoryIcon,
    Email, Phone, Cake, Transgender, Home, ContactPhone // Added icons for Information Section
} from '@mui/icons-material';

import { 
    calculateSubjectAttendancePercentage, 
    groupAttendanceBySubject 
} from '../../../components/attendanceCalculator';
import CustomBarChart from '../../../components/CustomBarChart';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

// const BASE_URL = "https://sms-xi-rose.vercel.app";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://192.168.0.107:5000";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper sx={{ p: 2, boxShadow: 5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.96)', border: '1px solid #eee' }}>
                <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 10, height: 10, bgcolor: payload[0].color, borderRadius: '50%' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {payload[0].value.toFixed(1)}
                        {payload[0].unit || ""}
                    </Typography>
                </Stack>
            </Paper>
        );
    }
    return null;
};

const ViewStudent = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const reportRef = useRef();

    const { currentUser, userDetails, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const studentID = params.id;
    const address = "Student";
    const isTeacher = currentUser?.accountType === "Teacher" || window.location.pathname.includes("/Teacher/");

    // --- STATES ---
    const [tabValue, setTabValue] = useState('1');
    const [selectedSection, setSelectedSection] = useState('table');
    const [parentData, setParentData] = useState(null); 
    const [parentLeaveData, setParentLeaveData] = useState([]); 

    // --- FETCH DATA ---
    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    useEffect(() => {
        if (userDetails?.sclassName?._id) {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
        if (userDetails?._id) {
            fetchParentInfo();
        }
    }, [dispatch, userDetails?._id]);

    const fetchParentInfo = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/ParentByStudent/${studentID}`);
            if (res.data) {
                setParentData(res.data);
                setParentLeaveData(res.data.leaves || []);
            }
        } catch (err) {
            console.log("No parent record associated with this student.");
            setParentData(null);
            setParentLeaveData([]);
        }
    };

    // --- HANDLERS ---
    const handleTabChange = (event, newValue) => setTabValue(newValue);
    const handleSectionChange = (event, newSection) => setSelectedSection(newSection);

    const handleApprove = async (leaveId) => {
        try {
            const parentId = parentData?._id;
            if (!parentId) return alert("Parent reference missing.");

            await axios.put(`${BASE_URL}/ApproveLeave/${parentId}/${leaveId}`);
            alert("Leave Approved!");
            fetchParentInfo(); 
        } catch (err) {
            console.error("Error approving leave:", err);
            alert("Could not approve leave. Check backend connection.");
        }
    };

    const removeSubAttendance = (subId) => {
        dispatch(updateStudentFields(studentID, { subId }, "RemoveStudentSubAtten"))
            .then(() => dispatch(getUserDetails(studentID, address)));
    };
    
    const removeMark = (subId) => {
        dispatch(updateStudentFields(studentID, { subId }, "RemoveStudentMark"))
            .then(() => dispatch(getUserDetails(studentID, address)));
    };

    const downloadPDF = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${userDetails?.name}_Report.pdf`);
    };

    // --- SECTIONS ---
    const DetailsSection = () => (
        <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 5, textAlign: 'center', p: 4, border: '1px solid #eee' }}>
   <Avatar
    src={userDetails?.profilePic || ""}
    sx={{
        width: 100,
        height: 100,
        margin: '0 auto',
        bgcolor: theme.palette.primary.main,
        mb: 2,
        fontSize: '2.5rem'
    }}
>
    {!userDetails?.profilePic && userDetails?.name?.charAt(0)}
</Avatar>
                        <Typography variant="h5" fontWeight="800">{userDetails?.name}</Typography>
                        <Chip label="Student Profile" color="primary" variant="outlined" size="small" sx={{ mt: 1, fontWeight: 600 }} />
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 5, p: 1, border: '1px solid #eee' }}>
                        <Stack>
                            {[
                                { icon: <AccountCircle color="primary" />, label: 'Full Name', value: userDetails?.name },
                                { icon: <Fingerprint sx={{ color: '#673ab7' }} />, label: 'Roll Number', value: userDetails?.rollNum },
                                { icon: <ClassIcon sx={{ color: '#ff9800' }} />, label: 'Class', value: userDetails?.sclassName?.sclassName },
                                { icon: <SchoolIcon color="info" />, label: 'Institution', value: userDetails?.school?.schoolName }
                            ].map((item, index) => (
                                <Box key={index} sx={{ p: 2.5, display: 'flex', alignItems: 'center', borderBottom: index === 3 ? 'none' : '1px solid #f5f5f5' }}>
                                    <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.03)', mr: 3 }}>{item.icon}</Avatar>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase' }}>{item.label}</Typography>
                                        <Typography variant="body1" fontWeight="700">{item.value || 'Not Assigned'}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            {/* Information Section - FIXED & INTEGRATED */}
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Personal Information
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    
                    <Grid container spacing={4}>
                        <InfoBox icon={<Email color="primary" />} label="Email Address" value={userDetails?.email} />
                        <InfoBox icon={<Phone color="primary" />} label="Phone Number" value={userDetails?.phone} />
                        <InfoBox icon={<Cake color="primary" />} label="Date of Birth" value={userDetails?.dob} />
                        <InfoBox icon={<Transgender color="primary" />} label="Gender" value={userDetails?.gender} />
                        <InfoBox icon={<ContactPhone color="primary" />} label="Emergency Contact" value={userDetails?.emergencyContact} />
                        <InfoBox icon={<Home color="primary" />} label="Home Address" value={userDetails?.address} fullWidth />
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );

    const LeaveSection = () => {
        const displayLeaves = isTeacher 
            ? parentLeaveData.filter(l => l.status === "Pending") 
            : parentLeaveData;

        return (
            <Box sx={{ pb: 8 }}>
                <Typography variant="h5" fontWeight="800" sx={{ mb: 3 }}>Leave Requests</Typography>
                <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    {isTeacher && <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayLeaves.length > 0 ? (
                                    displayLeaves.map((leave, index) => (
                                        <StyledTableRow key={index}>
                                            <StyledTableCell>{new Date(leave.leaveDate).toLocaleDateString()}</StyledTableCell>
                                            <StyledTableCell>{leave.leaveReason}</StyledTableCell>
                                            <StyledTableCell>
                                                <Chip label={leave.status} size="small" color={leave.status === 'Pending' ? 'warning' : 'success'} />
                                            </StyledTableCell>
                                            {isTeacher && (
                                                <StyledTableCell align="center">
                                                    <Button 
                                                        variant="contained" 
                                                        color="success" 
                                                        size="small"
                                                        startIcon={<AssignmentTurnedInIcon />}
                                                        onClick={() => handleApprove(leave._id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                </StyledTableCell>
                                            )}
                                        </StyledTableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>No leave records found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        );
    };

    const AttendanceSection = () => {
        const attendance = userDetails?.attendance || [];
        const attendanceData = Object.entries(groupAttendanceBySubject(attendance));
        return (
            <Box sx={{ pb: 8 }}>
                <Typography variant="h5" fontWeight="800" sx={{ mb: 3 }}>Attendance Log</Typography>
                {selectedSection === 'table' ? (
                    <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
                        <Table>
                            <TableBody>
                                {attendanceData.map(([name, { present, sessions, subId }], index) => {
                                    const percentage = calculateSubjectAttendancePercentage(present, sessions);
                                    return (
                                        <StyledTableRow key={index}>
                                            <StyledTableCell sx={{ fontWeight: 700 }}>{name}</StyledTableCell>
                                            <StyledTableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <LinearProgress variant="determinate" value={Number(percentage)} sx={{ flexGrow: 1, height: 8, borderRadius: 5 }} />
                                                    <Typography variant="body2" fontWeight="700">{percentage}%</Typography>
                                                </Box>
                                            </StyledTableCell>
                                            <StyledTableCell align="right">
                                                {isTeacher && (
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Button variant="contained" size="small" onClick={() => navigate(`/Teacher/student/attendance/${studentID}/${subId}`)}>Take</Button>
                                                        <IconButton size="small" onClick={() => removeSubAttendance(subId)}><DeleteIcon color="error" fontSize="small" /></IconButton>
                                                    </Stack>
                                                )}
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Paper>
                ) : (
                    <CustomBarChart chartData={attendanceData.map(([name, { present, sessions }]) => ({ subject: name, attendancePercentage: calculateSubjectAttendancePercentage(present, sessions) }))} dataKey="attendancePercentage" />
                )}
            </Box>
        );
    };

    const MarksSection = () => {
        const marks = userDetails?.examResult || [];
        const subjectsWithNoMarks = subjectsList?.filter((sub) => !marks.some((m) => m.subName?._id === sub._id));
        return (
            <Box sx={{ pb: 8 }}>
                <Typography variant="h5" fontWeight="800" sx={{ mb: 4 }}>Academic Performance</Typography>
                <Grid container spacing={3}>
                    {marks.map((result, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ borderRadius: 4, border: '1px solid #eee', position: 'relative' }}>
                                {isTeacher && (
                                    <IconButton size="small" sx={{ position: 'absolute', top: 12, right: 12 }} onClick={() => removeMark(result.subName?._id)}>
                                        <DeleteIcon fontSize="small" color="error" />
                                    </IconButton>
                                )}
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="700" color="primary">{result.subName?.subName}</Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Stack direction="row" alignItems="baseline" spacing={1}>
                                        <Typography variant="h3" fontWeight="900">{result.marksObtained}</Typography>
                                        <Typography variant="body1" color="text.secondary">/ {result.totalMarks || 100}</Typography>
                                    </Stack>
                                    <Button fullWidth variant="outlined" size="small" startIcon={<EditIcon />} sx={{ mt: 2 }} onClick={() => navigate(`/Teacher/class/student/marks/${studentID}/${result.subName?._id}`)}>Edit</Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    {isTeacher && subjectsWithNoMarks?.map((subject, index) => (
                        <Grid item xs={12} sm={6} md={4} key={`add-${index}`}>
                            <Card sx={{ borderRadius: 4, border: '1px dashed #ccc', backgroundColor: '#fafafa', textAlign: 'center' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="700" color="textSecondary">{subject.subName}</Typography>
                                    <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2, mt: 2 }} onClick={() => navigate(`/Teacher/class/student/marks/${studentID}/${subject._id}`)}>Add Marks</Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    const AnalyticsSection = () => {
        const examData = userDetails?.examResult?.map(item => ({ 
            subject: item.subName?.subName || "Subject", 
            marks: item.marksObtained || 0 
        })) || [];
        const totalSessions = userDetails?.attendance?.length || 0;
        const presentCount = userDetails?.attendance?.filter(a => a.status === 'Present').length || 0;
        const attendanceRate = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(0) : 0;

        return (
            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="800">Analytics</Typography>
                    <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={downloadPDF}>Report</Button>
                </Stack>
                <Box ref={reportRef} sx={{ p: 4, bgcolor: '#fff', borderRadius: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: '#f8f9fa' }}>
                                <Typography variant="h4" fontWeight="800" color="primary">{attendanceRate}%</Typography>
                                <Typography variant="body2">Attendance Rate</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={examData}>
                                    <XAxis dataKey="subject" />
                                    <YAxis /><Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="marks" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
            <TabContext value={tabValue}>
                <Paper sx={{ borderRadius: 4, mb: 4, p: 0.5 }} elevation={0} variant="outlined">
                    <TabList onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                        <Tab label="Profile" value="1" />
                        <Tab label="Attendance" value="2" />
                        <Tab label="Marks" value="3" />
                        <Tab label="Analytics" value="4" />
                        <Tab label="Leave Apps" value="5" />
                    </TabList>
                </Paper>

                <TabPanel value="1"><DetailsSection /></TabPanel>
                <TabPanel value="2"><AttendanceSection /></TabPanel>
                <TabPanel value="3"><MarksSection /></TabPanel>
                <TabPanel value="4"><AnalyticsSection /></TabPanel>
                <TabPanel value="5"><LeaveSection /></TabPanel>

                {(tabValue === '2' || tabValue === '3') && (
                    <Paper sx={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', borderRadius: 10, zIndex: 1000 }}>
                        <BottomNavigation action={selectedSection} value={selectedSection} onChange={handleSectionChange} showLabels sx={{ width: 300 }}>
                            <BottomNavigationAction label="Table" value="table" icon={<TableChartIcon />} />
                            <BottomNavigationAction label="Graph" value="chart" icon={<InsightsIcon />} />
                        </BottomNavigation>
                    </Paper>
                )}
            </TabContext>
        </Container>
    );
};

// Helper component for layout
const InfoBox = ({ icon, label, value, fullWidth = false }) => (
    <Grid item xs={12} sm={fullWidth ? 12 : 6}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha('#1976d2', 0.05),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" color="textSecondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight="700">
                    {value || "Not Provided"}
                </Typography>
            </Box>
        </Stack>
    </Grid>
);

export default ViewStudent;