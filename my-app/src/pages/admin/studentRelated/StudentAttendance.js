import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, Button, IconButton, Collapse, Chip, Snackbar, Alert, CircularProgress
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "sms-nine-beige.vercel.app";

function StudentAttendance() {
  const [attendanceFeed, setAttendanceFeed] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });

  const user = JSON.parse(localStorage.getItem("user"));
  const schoolId = user?._id;

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/AllSubjects/${schoolId}`);
      if (Array.isArray(res.data)) setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  }, [schoolId]);

  const fetchAllSchoolAttendance = useCallback(async () => {
    if (!schoolId) return;
    try {
      const classRes = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);
      const classes = classRes.data || [];

      const studentPromises = classes.map(async (cls) => {
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
      console.error("Error fetching school records:", err);
      setNotification({ open: true, message: "Failed to load records", severity: "error" });
    }
  }, [schoolId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAllSchoolAttendance(), fetchSubjects()]);
      setLoading(false);
    };
    loadData();
    const interval = setInterval(fetchAllSchoolAttendance, 10000);
    return () => clearInterval(interval);
  }, [fetchAllSchoolAttendance, fetchSubjects]);

  const getTeacherName = (subId) => {
    if (!subId) return "Not Assigned";
    const targetId = typeof subId === 'object' ? subId._id : subId;
    const subject = subjects.find((s) => s._id === targetId);
    return subject?.teacher?.name || "Teacher";
  };

  // --- NEW: DOWNLOAD FUNCTION ---
  const handleDownload = (className, month, records) => {
    const headers = ["Roll Number", "Name", "Date", "Status", "Marked By"];
    const rows = records.map(rec => [
      rec.rollNum,
      rec.name,
      new Date(rec.attRecord.date).toLocaleDateString(),
      rec.attRecord.status,
      getTeacherName(rec.attRecord.subName)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_${className}_${month.replace(" ", "_")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classGroups = {};
  attendanceFeed.forEach((student) => {
    const className = student.displayClassName || "Unassigned";
    if (!student.attendance) return;

    student.attendance.forEach((att) => {
      const monthName = new Date(att.date).toLocaleString("default", { month: "long", year: "numeric" });
      if (!classGroups[className]) classGroups[className] = {};
      if (!classGroups[className][monthName]) classGroups[className][monthName] = [];
      classGroups[className][monthName].push({ ...student, attRecord: att });
    });
  });

  const sortedClassNames = Object.keys(classGroups).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const toggleMonthExpand = (key) => setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box p={4}>
      <Typography variant="h4" mb={4} fontWeight="bold" color="primary">
        School Attendance Records (Admin)
      </Typography>

      {sortedClassNames.length === 0 ? (
        <Typography color="textSecondary">No history records found.</Typography>
      ) : (
        sortedClassNames.map((className) => (
          <Box key={className} mb={4}>
            <Typography variant="h6" sx={{ bgcolor: "#34495e", color: "white", p: 1.5, borderRadius: "4px" }}>
              {className}
            </Typography>

            {Object.keys(classGroups[className]).sort((a, b) => new Date(b) - new Date(a)).map((month) => {
              const monthKey = `${className}-${month}`;
              const records = classGroups[className][month];

              return (
                <Box key={monthKey} ml={1} mt={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => toggleMonthExpand(monthKey)}
                      sx={{ justifyContent: 'space-between', py: 1, textTransform: 'none', fontWeight: 'bold' }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        {month}
                        <Chip label={`${records.length} Records`} size="small" />
                      </Box>
                      {expandedMonths[monthKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Button>
                    
                    {/* DOWNLOAD BUTTON */}
                    <IconButton 
                      color="primary" 
                      onClick={() => handleDownload(className, month, records)}
                      sx={{ border: '1px solid #1976d2', borderRadius: '4px' }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedMonths[monthKey]}>
                    <Paper variant="outlined" sx={{ mt: 0.5 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell>Roll</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Marked By</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {records.sort((a, b) => new Date(b.attRecord.date) - new Date(a.attRecord.date)).map((rec, i) => (
                            <TableRow key={i} hover>
                              <TableCell>{rec.rollNum}</TableCell>
                              <TableCell>{rec.name}</TableCell>
                              <TableCell>{new Date(rec.attRecord.date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Chip
                                  label={rec.attRecord.status}
                                  size="small"
                                  color={rec.attRecord.status === "Present" ? "success" : "error"}
                                />
                              </TableCell>
                              <TableCell>{getTeacherName(rec.attRecord.subName)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        ))
      )}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentAttendance;