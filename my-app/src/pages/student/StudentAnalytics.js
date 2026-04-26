import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Grid, Card, CardContent, CircularProgress, 
    useTheme, Divider, Avatar, Stack 
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
// ✅ UI UPGRADE: Import AreaChart and Area for Gradients
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import axios from 'axios';

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5000";

const StudentAnalytics = () => {
    const theme = useTheme();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const studentId = user?._id;

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/Student/${studentId}`);
                setStudentData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Analytics Error:", err);
                setLoading(false);
            }
        };
        if (studentId) fetchAnalytics();
    }, [studentId]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={60} /></Box>;
    if (!studentData) return <Typography sx={{ p: 4 }}>No data available for analytics.</Typography>;

    // --- 📊 Data Processing ---
    
    // 1. Exam Results (Bar)
    const examData = studentData.examResult?.map(item => ({
        subject: item.subName?.subName || "Subject",
        marks: item.marksObtained
    })) || [];

    // 2. Quiz Performance (Gradiant Area)
    const quizData = studentData.quizResults?.map(item => ({
        name: item.quizTitle,
        score: (item.score / item.total) * 100
    })) || [];

    const latestQuizScore = quizData.length > 0 ? quizData[quizData.length - 1].score : 0;
    const avgQuizScore = quizData.length > 0 ? (quizData.reduce((a, b) => a + b.score, 0) / quizData.length).toFixed(1) : 0;

    // --- ✅ UI UPGRADE: CUSTOM TOOLTIP COMPONENT ---
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

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f0f2f5', minHeight: '100vh' }}>
            {/* Header Area */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                    My Performance Hub
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56, boxShadow: 3 }}>
                    <InsightsIcon fontSize="large" />
                </Avatar>
            </Stack>

            <Grid container spacing={3}>
                
                {/* --- Row 1: Modern Quick Stats Cards --- */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}><MenuBookIcon /></Avatar>
                                <Typography variant="h6" fontWeight="bold">Average Quiz Score</Typography>
                            </Stack>
                            <Typography variant="h2" color="primary" sx={{ fontWeight: 800, letterSpacing: '-2px' }}>
                                {avgQuizScore}<span style={{ fontSize: '30px', fontWeight: 500, color: '#757575' }}>%</span>
                            </Typography>
                            <Typography variant="body2" color="textSecondary">Across {quizData.length} quizzes</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#e8f5e9', color: '#4caf50' }}><AssignmentTurnedInIcon /></Avatar>
                                <Typography variant="h6" fontWeight="bold">Attendance Health</Typography>
                            </Stack>
                            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-2px', color: '#4caf50' }}>
                                {((studentData.attendance.filter(a => a.status === 'Present').length / studentData.attendance.length) * 100).toFixed(0)}
                                <span style={{ fontSize: '30px', fontWeight: 500, color: '#757575' }}>%</span>
                            </Typography>
                            <Typography variant="body2" color="textSecondary">Overall Present Rate</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* --- Row 2: Subject Performance (Gradient Bar) --- */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Class Subject Marks (Rs)
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={examData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                {/* ✅ UI UPGRADE: DEFINES GRADIENT FOR BARS */}
                                <defs>
                                    <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor={theme.palette.primary.light} stopOpacity={0.5}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="subject" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0, 0, 0, 0.03)'}} />
                                {/* ✅ UI UPGRADE: Apply Gradient and Radius */}
                                <Bar dataKey="marks" fill="url(#colorMarks)" radius={[8, 8, 0, 0]} barSize={50} unit=" Marks" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* --- Row 3: Quiz Progress (Area Chart with Gradient) --- */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Quiz Progress Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            {/* ✅ UI UPGRADE: Change LineChart to AreaChart */}
                            <AreaChart data={quizData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                {/* ✅ UI UPGRADE: DEFINES GRADIENT FOR AREA */}
                                <defs>
                                    <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip content={<CustomTooltip />} />
                                {/* ✅ UI UPGRADE: Change Line to Area with stroke and fill */}
                                <Area type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={3} fillOpacity={1} fill="url(#colorQuiz)" unit="%" activeDot={{ r: 8 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* --- Row 4: Attendance (Pie Chart with Clean Legend) --- */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.06)', height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Attendance Overview
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Present', value: studentData.attendance.filter(a => a.status === 'Present').length },
                                        { name: 'Absent', value: studentData.attendance.filter(a => a.status === 'Absent').length }
                                    ]}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    cornerRadius={10} // ✅ UI UPGRADE: Round the corners of the pie
                                >
                                    <Cell fill="#4caf50" stroke="none" />
                                    <Cell fill="#ef5350" stroke="none" />
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default StudentAnalytics;