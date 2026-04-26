import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Button, TextField, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Container, Grid, Card, Chip, Stack, TableContainer, Tooltip,
  Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// const BASE_URL = "http://localhost:5000";
// const BASE_URL = "https://sms-xi-rose.vercel.app";
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5000";

function TeacherSelfAttendance() {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [records, setRecords] = useState([]);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?._id;

  useEffect(() => {
    fetchTeacherAttendance();
  }, []);

  const fetchTeacherAttendance = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/Teacher/${teacherId}`);
      setRecords(res.data.attendance || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        () => resolve(null)
      );
    });
  };

  const handleSave = async () => {
    if (!date || !status) return;
    const today = new Date();
    const selectedDate = new Date(date);
    if (selectedDate > today) {
      alert("Future attendance is not allowed");
      return;
    }
    try {
      const location = await getLocation();
      const now = new Date();
      const data = {
        date: selectedDate,
        time: now.toTimeString().split(" ")[0],
        status: status,
        location: location
      };
      await axios.post(`${BASE_URL}/TeacherAttendance/${teacherId}`, data);
      setStatus("");
      setDate("");
      fetchTeacherAttendance();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLeaveApply = async () => {
    if (!leaveDate || !leaveReason) return;
    try {
      const data = { date: new Date(leaveDate), status: "Leave", reason: leaveReason };
      await axios.post(`${BASE_URL}/TeacherAttendance/${teacherId}`, data);
      setLeaveOpen(false);
      setLeaveDate("");
      setLeaveReason("");
      fetchTeacherAttendance();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (recordId) => {
    try {
      await axios.put(`${BASE_URL}/RemoveTeacherAtten/${teacherId}`, { recordId });
      fetchTeacherAttendance();
    } catch (err) {
      console.log(err);
    }
  };

  /* -------- Separating & Grouping Records -------- */
  const attendanceRecords = records.filter(r => r.status !== "Leave");
  const leaveRecords = records.filter(r => r.status === "Leave");

  const groupDataByMonth = (data) => {
    const grouped = {};
    data.forEach((rec) => {
      const month = new Date(rec.date).toLocaleString("default", { month: "long", year: "numeric" });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(rec);
    });
    return grouped;
  };

  const groupedAttendance = groupDataByMonth(attendanceRecords);
  const groupedLeaves = groupDataByMonth(leaveRecords);

  const sortedAttendanceMonths = Object.keys(groupedAttendance).sort((a, b) => new Date(b) - new Date(a));
  const sortedLeaveMonths = Object.keys(groupedLeaves).sort((a, b) => new Date(b) - new Date(a));

  const renderLocation = (location) => {
    if (!location) return "—";
    const { latitude, longitude } = location;
    return (
      <Tooltip title="View on Map">
        <IconButton 
          size="small" 
          color="primary"
          component="a" 
          href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
          target="_blank"
        >
          <LocationOnIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      {/* Header */}
      <Box mb={5} textAlign={{ xs: 'center', md: 'left' }}>
        <Typography variant="h3" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-1.5px', mb: 1 }}>
          Attendance Hub
        </Typography>
        <Typography variant="h6" color="textSecondary" fontWeight="400">
          Seamlessly manage your professional presence and leave requests.
        </Typography>
      </Box>

      {/* Modern Action Card */}
      <Card sx={{ p: 4, mb: 6, borderRadius: 5, boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              fullWidth 
              type="date" 
              label="Select Date" 
              InputLabelProps={{ shrink: true }} 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField 
              select 
              fullWidth 
              label="Status" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            >
              <MenuItem value="Present">Present</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ height: '100%' }}>
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<PostAddIcon />} 
                onClick={handleSave} 
                sx={{ borderRadius: 3, height: 56, textTransform: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: 'none' }}
              >
                Log Entry
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                color="warning" 
                startIcon={<EventBusyIcon />} 
                onClick={() => setLeaveOpen(true)} 
                sx={{ borderRadius: 3, height: 56, textTransform: 'none', fontWeight: 700, fontSize: '1rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Request Leave
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={4}>
        {/* Attendance History Section */}
        <Grid item xs={12} md={7}>
          <Box display="flex" alignItems="center" mb={3} gap={1.5}>
            <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" fontWeight="800">History</Typography>
          </Box>
          
          {sortedAttendanceMonths.length === 0 && (
             <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                <Typography color="textDisabled" fontWeight="500">Your attendance logs will appear here.</Typography>
             </Paper>
          )}

          {sortedAttendanceMonths.map((month) => (
            <Accordion key={month} sx={{ mb: 2, borderRadius: '16px !important', '&:before': { display: 'none' }, border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}>
                <Typography fontWeight="700" variant="subtitle1">{month}</Typography>
                <Chip label={`${groupedAttendance[month].length} Entries`} size="small" variant="outlined" sx={{ ml: 2, fontWeight: 700, borderColor: '#e2e8f0' }} />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedAttendance[month].sort((a, b) => new Date(b.date) - new Date(a.date)).map((rec) => (
                        <TableRow key={rec._id} hover>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" fontWeight="700">{new Date(rec.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</Typography>
                            <Typography variant="caption" color="textSecondary">{rec.time || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={rec.status} 
                              size="small" 
                              sx={{ 
                                fontWeight: 800, fontSize: '0.7rem',
                                bgcolor: rec.status === "Present" ? '#dcfce7' : '#fee2e2',
                                color: rec.status === "Present" ? '#166534' : '#991b1b',
                                borderRadius: 1.5
                              }} 
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {renderLocation(rec.location)}
                              <IconButton color="error" size="small" onClick={() => handleDelete(rec._id)} sx={{ bgcolor: '#fff1f2', '&:hover': { bgcolor: '#ffe4e6' } }}>
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>

        {/* Leave Log Section with Monthly Dropdowns */}
        <Grid item xs={12} md={5}>
          <Box display="flex" alignItems="center" mb={3} gap={1.5}>
            <EventBusyIcon sx={{ color: 'warning.main', fontSize: 28 }} />
            <Typography variant="h5" fontWeight="800">Leave Log</Typography>
          </Box>

          {sortedLeaveMonths.length === 0 && (
             <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                <Typography color="textDisabled" fontWeight="500">No leave requests found.</Typography>
             </Paper>
          )}

          {sortedLeaveMonths.map((month) => (
            <Accordion key={month} sx={{ mb: 2, borderRadius: '16px !important', '&:before': { display: 'none' }, border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'warning.main' }} />}>
                <Typography fontWeight="700" variant="subtitle1">{month}</Typography>
                <Chip label={`${groupedLeaves[month].length} Requests`} size="small" variant="outlined" sx={{ ml: 2, fontWeight: 700, borderColor: '#e2e8f0' }} />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: '#fffbeb' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#92400e' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#92400e' }}>Reason</TableCell>
                        <TableCell align="right"></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedLeaves[month].sort((a, b) => new Date(b.date) - new Date(a.date)).map((rec) => (
                        <TableRow key={rec._id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{new Date(rec.date).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.85rem' }}>{rec.reason || "—"}</TableCell>
                          <TableCell align="right">
                            <IconButton color="error" size="small" onClick={() => handleDelete(rec._id)}>
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
      </Grid>

      {/* Modern Dialog */}
      <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: '900', fontSize: '1.5rem' }}>New Leave Request</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <TextField fullWidth type="date" label="Effective Date" InputLabelProps={{ shrink: true }} value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth multiline rows={4} label="Brief Reason" placeholder="Explain your request..." value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setLeaveOpen(false)} color="inherit" sx={{ fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleLeaveApply} variant="contained" color="warning" sx={{ borderRadius: 2.5, px: 4, fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TeacherSelfAttendance;

