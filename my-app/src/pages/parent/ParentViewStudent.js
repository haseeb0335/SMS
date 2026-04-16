import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
    Container, Typography, Grid, Card, CardContent, Avatar, Box,
    CircularProgress, Tab, Paper, Divider, Stack, Chip, LinearProgress,
    Button, Table, TableBody, BottomNavigation, BottomNavigationAction, 
    useTheme, TableCell, TableRow, tableCellClasses
} from "@mui/material";
import { styled } from '@mui/material/styles';

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import {
    Insights as InsightsIcon,
    TableChart as TableChartIcon,
    AccountCircle,
    Class as ClassIcon,
    Fingerprint,
    School as SchoolIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    Download as DownloadIcon
} from "@mui/icons-material";

import {
    ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis,
    Tooltip, PieChart, Pie, Cell, Legend
} from "recharts";

// Inlined Styled Components to fix the "outside of src" error
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

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

const ParentViewStudent = () => {
    const theme = useTheme();
    const reportRef = useRef();
    const { currentUser } = useSelector((state) => state.user);

    const [studentData, setStudentData] = useState(null);
    const [tabValue, setTabValue] = useState('1');
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState('table');

    const studentId = currentUser?.studentId;

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await axios.get(`https://sms-xi-rose.vercel.app/Student/${studentId}`);
                setStudentData(res.data);
                setLoading(false);
            } catch (err) {
                console.log(err);
                setLoading(false);
            }
        };
        if (studentId) fetchStudent();
    }, [studentId]);

    const handleTabChange = (event, newValue) => setTabValue(newValue);
    const handleSectionChange = (event, newSection) => setSelectedSection(newSection);

    const downloadPDF = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${studentData?.name}_Report.pdf`);
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
    if (!studentData) return <Typography>No student data found</Typography>;

    const examData = studentData.examResult?.map((item) => ({
        subject: item.subName?.subName || "Subject",
        marks: item.marksObtained || 0
    })) || [];

    const totalSessions = studentData.attendance?.length || 0;
    const presentCount = studentData.attendance?.filter((a) => a.status === "Present").length || 0;
    const attendanceRate = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(0) : 0;

    const DetailsSection = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 5, textAlign: 'center', p: 4, border: '1px solid #eee' }}>
                    <Avatar sx={{ width: 100, height: 100, margin: '0 auto', bgcolor: theme.palette.primary.main, mb: 2, fontSize: '2.5rem' }}>
                        {studentData?.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" fontWeight="800">{studentData?.name}</Typography>
                    <Chip label="Student Profile" color="primary" variant="outlined" size="small" sx={{ mt: 1, fontWeight: 600 }} />
                </Card>
            </Grid>
            <Grid item xs={12} md={8}>
                <Card sx={{ borderRadius: 5, p: 1, border: '1px solid #eee' }}>
                    <Stack>
                        {[
                            { icon: <AccountCircle color="primary" />, label: 'Full Name', value: studentData?.name },
                            { icon: <Fingerprint sx={{ color: '#673ab7' }} />, label: 'Roll Number', value: studentData?.rollNum },
                            { icon: <ClassIcon sx={{ color: '#ff9800' }} />, label: 'Class', value: studentData?.sclassName?.sclassName },
                            { icon: <SchoolIcon color="info" />, label: 'Institution', value: studentData?.school?.schoolName }
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
    );

    const AttendanceSection = () => (
        <Box sx={{ pb: 8 }}>
            <Typography variant="h5" fontWeight="800" sx={{ mb: 3 }}>Attendance Overview</Typography>
            {selectedSection === 'table' ? (
                <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
                    <Table>
                        <TableBody>
                            <StyledTableRow>
                                <StyledTableCell sx={{ fontWeight: 700 }}>Overall Attendance</StyledTableCell>
                                <StyledTableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LinearProgress variant="determinate" value={Number(attendanceRate)} sx={{ flexGrow: 1, height: 8, borderRadius: 5 }} />
                                        <Typography variant="body2" fontWeight="700">{attendanceRate}%</Typography>
                                    </Box>
                                </StyledTableCell>
                            </StyledTableRow>
                        </TableBody>
                    </Table>
                </Paper>
            ) : (
                <Card sx={{ p: 3, borderRadius: 4 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={[{ name: 'Present', value: presentCount }, { name: 'Absent', value: totalSessions - presentCount }]} innerRadius={60} outerRadius={80} dataKey="value">
                                <Cell fill="#4caf50" /><Cell fill="#ef5350" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            )}
        </Box>
    );

    const MarksSection = () => (
        <Box sx={{ pb: 8 }}>
            <Typography variant="h5" fontWeight="800" sx={{ mb: 4 }}>Academic Performance</Typography>
            <Grid container spacing={3}>
                {studentData.examResult?.map((result, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ borderRadius: 4, border: '1px solid #eee' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight="700" color="primary">
                                    {result.subName?.subName}
                                </Typography>
                                <Divider sx={{ my: 1.5 }} />
                                <Stack direction="row" alignItems="baseline" spacing={1}>
                                    <Typography variant="h3" fontWeight="900">{result.marksObtained}</Typography>
                                    <Typography variant="body1" color="text.secondary">/ {result.totalMarks || 100}</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const AnalyticsSection = () => (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="800">Student Analytics</Typography>
                <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={downloadPDF} sx={{ borderRadius: 2, textTransform: 'none' }}>Download Report</Button>
            </Stack>
            <Box ref={reportRef} sx={{ p: 4, bgcolor: '#fff', borderRadius: 4 }}>
                <Box sx={{ mb: 4, borderBottom: '2px solid #eee', pb: 2 }}>
                    <Typography variant="h4" fontWeight="900" color="primary">Performance Report</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="h6" color="textSecondary">Name: <b>{studentData?.name}</b></Typography>
                        <Typography variant="h6" color="textSecondary">Roll No: <b>{studentData?.rollNum}</b></Typography>
                    </Stack>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2, borderRadius: 4, bgcolor: '#f8f9fa' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: '#e8f5e9', color: '#4caf50' }}><AssignmentTurnedInIcon /></Avatar>
                                <Box><Typography variant="h4" fontWeight="800" sx={{ color: '#4caf50' }}>{attendanceRate}%</Typography><Typography variant="body2" color="textSecondary">Attendance Rate</Typography></Box>
                            </Stack>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={3}>Subject Marks Overview</Typography>
                            <Box sx={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={examData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="subject" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="marks" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
            <TabContext value={tabValue}>
                <Paper sx={{ borderRadius: 4, mb: 4, p: 0.5 }} elevation={0} variant="outlined">
                    <TabList onChange={handleTabChange} variant="fullWidth">
                        <Tab label="Profile" value="1" />
                        <Tab label="Attendance" value="2" />
                        <Tab label="Marks" value="3" />
                        <Tab label="Analytics" value="4" />
                    </TabList>
                </Paper>
                <TabPanel value="1"><DetailsSection /></TabPanel>
                <TabPanel value="2"><AttendanceSection /></TabPanel>
                <TabPanel value="3"><MarksSection /></TabPanel>
                <TabPanel value="4"><AnalyticsSection /></TabPanel>

                {tabValue === '2' && (
                    <Paper sx={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', borderRadius: 10, zIndex: 1000 }}>
                        <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels sx={{ width: 300 }}>
                            <BottomNavigationAction label="Table" value="table" icon={<TableChartIcon />} />
                            <BottomNavigationAction label="Graph" value="chart" icon={<InsightsIcon />} />
                        </BottomNavigation>
                    </Paper>
                )}
            </TabContext>
        </Container>
    );
};

export default ParentViewStudent;