import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Avatar,
  Stack
} from "@mui/material";

import InsightsIcon from "@mui/icons-material/Insights";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import axios from "axios";
import { useSelector } from "react-redux";

const BASE_URL = "https://sms-xi-rose.vercel.app";

const ParentAnalytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // True under 600px
  
  const { currentUser } = useSelector((state) => state.user);

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = currentUser?.studentId;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/Student/${studentId}`);
        setStudentData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Parent Analytics Error:", err);
        setLoading(false);
      }
    };

    if (studentId) fetchAnalytics();
  }, [studentId]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress size={60} />
      </Box>
    );

  if (!studentData)
    return <Typography sx={{ p: isMobile ? 2 : 4, textAlign: 'center' }}>No student data found.</Typography>;

  // Exam results
  const examData =
    studentData.examResult?.map((item) => ({
      subject: item.subName?.subName || "Subject",
      marks: item.marksObtained
    })) || [];

  // Quiz results
  const quizData =
    studentData.quizResults?.map((item) => ({
      name: item.quizTitle,
      score: (item.score / item.total) * 100
    })) || [];

  const avgQuizScore =
    quizData.length > 0
      ? (quizData.reduce((a, b) => a + b.score, 0) / quizData.length).toFixed(1)
      : 0;

  const presentCount = studentData.attendance.filter(a => a.status === "Present").length;
  const absentCount = studentData.attendance.filter(a => a.status === "Absent").length;

  const attendancePercent =
    studentData.attendance.length > 0
      ? ((presentCount / studentData.attendance.length) * 100).toFixed(0)
      : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3, border: '1px solid #e2e8f0' }}>
          <Typography variant="caption" color="textSecondary" display="block">{label}</Typography>
          <Typography variant="body2" fontWeight="bold">
            {payload[0].value.toFixed(1)}
            {payload[0].unit || ""}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    // ADJUSTED: Dynamic outer container spacing padding for small screens vs desktops
    <Box sx={{ p: { xs: 1.5, sm: 3, md: 4 }, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      
      {/* ADJUSTED: Top layout header block uses responsive sizing & centers nicely if stacked */}
      <Stack 
        direction={isMobile ? "column-reverse" : "row"} 
        justifyContent="space-between" 
        alignItems={isMobile ? "flex-start" : "center"} 
        gap={2}
        sx={{ mb: 3 }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" sx={{ letterSpacing: "-0.5px" }}>
          {studentData?.name}'s Performance
        </Typography>
        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 42, height: 42, selfFlex: isMobile ? 'flex-end' : 'auto' }}>
          <InsightsIcon />
        </Avatar>
      </Stack>

      <Grid container spacing={isMobile ? 2 : 3}>

        {/* Quiz Score Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2", width: 36, height: 36 }}>
                  <MenuBookIcon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="700" color="textSecondary">Avg Quiz Score</Typography>
              </Stack>
              {/* ADJUSTED: Scaling Down text titles so they never wrap values */}
              <Typography variant={isMobile ? "h3" : "h2"} fontWeight="bold" color="primary">
                {avgQuizScore}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Across {quizData.length} quizzes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: "#e8f5e9", color: "#4caf50", width: 36, height: 36 }}>
                  <AssignmentTurnedInIcon fontSize="small" />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="700" color="textSecondary">Attendance</Typography>
              </Stack>
              {/* ADJUSTED: Font sizing scale fallback protection */}
              <Typography variant={isMobile ? "h3" : "h2"} fontWeight="bold" color="green">
                {attendancePercent}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Overall presence rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Subject Marks Bar Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight="800" mb={2}>
              Subject Marks
            </Typography>

            {/* ADJUSTED: Margins added inside charting components below to allow space for text labels on phone layouts */}
            <ResponsiveContainer width="100%" height={isMobile ? 260 : 350}>
              <BarChart data={examData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="marks" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quiz Progress Area Chart */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight="800" mb={2}>
              Quiz Progress
            </Typography>

            <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
              <AreaChart data={quizData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#8884d8" fillOpacity={0.2} fill="#8884d8" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Attendance Pie Chart */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight="800" mb={2}>
              Attendance Overview
            </Typography>

            <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Present", value: presentCount },
                    { name: "Absent", value: absentCount }
                  ]}
                  innerRadius={isMobile ? 45 : 60}
                  outerRadius={isMobile ? 75 : 100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#4caf50" />
                  <Cell fill="#ef5350" />
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ParentAnalytics;