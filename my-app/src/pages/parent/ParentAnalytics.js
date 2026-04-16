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
  Divider,
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

const ParentAnalytics = () => {
  const theme = useTheme();
  const { currentUser } = useSelector((state) => state.user);

  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = currentUser?.studentId;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`https://sms-xi-rose.vercel.app/Student/${studentId}`);
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
    return <Typography sx={{ p: 4 }}>No student data found.</Typography>;

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
        <Paper sx={{ p: 2, boxShadow: 5 }}>
          <Typography>{label}</Typography>
          <Typography fontWeight="bold">
            {payload[0].value.toFixed(1)}
            {payload[0].unit || ""}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
  {studentData?.name}'s Performance Dashboard
</Typography>
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <InsightsIcon />
        </Avatar>
      </Stack>

      <Grid container spacing={3}>

        {/* Quiz Score Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2" }}>
                  <MenuBookIcon />
                </Avatar>
                <Typography variant="h6">Average Quiz Score</Typography>
              </Stack>

              <Typography variant="h2" color="primary">
                {avgQuizScore}%
              </Typography>

              <Typography variant="body2">
                Across {quizData.length} quizzes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "#e8f5e9", color: "#4caf50" }}>
                  <AssignmentTurnedInIcon />
                </Avatar>
                <Typography variant="h6">Attendance</Typography>
              </Stack>

              <Typography variant="h2" color="green">
                {attendancePercent}%
              </Typography>

              <Typography variant="body2">
                Overall attendance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Subject Marks */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Subject Marks
            </Typography>

            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={examData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="marks" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Quiz Progress */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Quiz Progress
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={quizData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Attendance Pie */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Attendance Overview
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Present", value: presentCount },
                    { name: "Absent", value: absentCount }
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  <Cell fill="#4caf50" />
                  <Cell fill="#ef5350" />
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ParentAnalytics;