import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Button, TextField, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Container, Grid, Card, Chip, Stack, TableContainer, Tooltip,
  Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const BASE_URL = "https://sms-xi-rose.vercel.app";

function TeacherSelfAttendance() {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [records, setRecords] = useState([]);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?._id;

  const fetchTeacherAttendance = useCallback(async () => {
    if (!teacherId) return;
    try {
      const res = await axios.get(`${BASE_URL}/Teacher/${teacherId}`);
      setRecords(res.data.attendance || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchTeacherAttendance();
  }, [fetchTeacherAttendance]);

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
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (date > todayStr) {
      alert("Future attendance is not allowed");
      return;
    }
    
    try {
      const location = await getLocation();
      const now = new Date();
      const data = {
        date: new Date(date),
        time: now.toTimeString().split(" ")[0],
        status: status,
        location: location
      };
      await axios.post(`${BASE_URL}/TeacherAttendance/${teacherId}`, data);
      setStatus("");
      setDate("");
      fetchTeacherAttendance();
    } catch (err) {
      console.error("Error logging attendance:", err);
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
      console.error("Error applying for leave:", err);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.put(`${BASE_URL}/RemoveTeacherAtten/${teacherId}`, { recordId });
      fetchTeacherAttendance();
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  const attendanceRecords = records.filter(r => r.status !== "Leave");
  const leaveRecords = records.filter(r => r.status === "Leave");

  const groupDataByMonth = (data) => {
    const grouped = {};
    data.forEach((rec) => {
      if (!rec.date) return;
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
    if (!location || !location.latitude || !location.longitude) return "—";
    const { latitude, longitude } = location;
    return (
      <Tooltip title="View on Map">
        <IconButton 
          size="small" 
          color="primary"
          component="a" 
          href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
          target="_blank"
          rel="noopener noreferrer"
          sx={{ bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}
        >
          <LocationOnIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 5 }, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box mb={{ xs: 3, md: 5 }} textAlign={{ xs: 'center', sm: 'left' }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          fontWeight="900" 
          sx={{ color: '#0f172a', letterSpacing: '-0.5px', mb: 1 }}
        >
          Attendance Hub
        </Typography>
        <Typography variant={isMobile ? "body2" : "h6"} color="textSecondary" fontWeight="400">
          Seamlessly manage your professional presence and leave requests.
        </Typography>
      </Box>

      {/* Responsive Input Panel */}
      <Card sx={{ p: { xs: 2.5, sm: 4 }, mb: 4, borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Grid container spacing={2}>
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
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} sx={{ height: '100%' }}>
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<PostAddIcon />} 
                onClick={handleSave} 
                sx={{ borderRadius: 3, height: 56, textTransform: 'none', fontWeight: 700, fontSize: '0.95rem', boxShadow: 'none' }}
              >
                Log Entry
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                color="warning" 
                startIcon={<EventBusyIcon />} 
                onClick={() => setLeaveOpen(true)} 
                sx={{ borderRadius: 3, height: 56, textTransform: 'none', fontWeight: 700, fontSize: '0.95rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Request Leave
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={4}>
        {/* Attendance History Section */}
        <Grid item xs={12} md={7}>
          <Box display="flex" alignItems="center" mb={2} gap={1.5}>
            <CalendarMonthIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography variant="h6" fontWeight="800">History</Typography>
          </Box>
          
          {sortedAttendanceMonths.length === 0 && (
             <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                <Typography color="textDisabled" variant="body2" fontWeight="500">Your attendance logs will appear here.</Typography>
             </Paper>
          )}

          {sortedAttendanceMonths.map((month) => (
            <Accordion key={month} disableGutters elevation={0} sx={{ mb: 1.5, borderRadius: '12px !important', border: '1px solid #e2e8f0', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />} sx={{ px: 2 }}>
                <Typography fontWeight="700" variant="body1">{month}</Typography>
                <Chip label={`${groupedAttendance[month].length}`} size="small" variant="outlined" sx={{ ml: 1.5, fontWeight: 700, height: 20, fontSize: '0.75rem' }} />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {isMobile ? (
                  // Mobile Row UI
                  <Box sx={{ divideY: '1px solid #f1f5f9' }}>
                    {groupedAttendance[month].sort((a, b) => new Date(b.date) - new Date(a.date)).map((rec) => (
                      <Box key={rec._id} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                        <Box>
                          <Typography variant="body2" fontWeight="700">{new Date(rec.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
                          <Typography variant="caption" color="textSecondary">{rec.time || '—'}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Chip 
                            label={rec.status} 
                            size="small" 
                            sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: rec.status === "Present" ? '#dcfce7' : '#fee2e2', color: rec.status === "Present" ? '#166534' : '#991b1b', borderRadius: 1 }} 
                          />
                          {renderLocation(rec.location)}
                          <IconButton color="error" size="small" onClick={() => handleDelete(rec._id)} sx={{ bgcolor: '#fff1f2' }}>
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  // Desktop Table UI
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', pr: 2 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedAttendance[month].sort((a, b) => new Date(b.date) - new Date(a.date)).map((rec) => (
                          <TableRow key={rec._id} hover>
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight="700">{new Date(rec.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</Typography>
                              <Typography variant="caption" color="textSecondary">{rec.time || '—'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={rec.status} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: rec.status === "Present" ? '#dcfce7' : '#fee2e2', color: rec.status === "Present" ? '#166534' : '#991b1b', borderRadius: 1.5 }} />
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 2 }}>
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
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>

        {/* Leave Log Section */}
        <Grid item xs={12} md={5}>
          <Box display="flex" alignItems="center" mb={2} gap={1.5}>
            <EventBusyIcon sx={{ color: 'warning.main', fontSize: 24 }} />
            <Typography variant="h6" fontWeight="800">Leave Log</Typography>
          </Box>

          {sortedLeaveMonths.length === 0 && (
             <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, bgcolor: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                <Typography color="textDisabled" variant="body2" fontWeight="500">No leave requests found.</Typography>
             </Paper>
          )}

          {sortedLeaveMonths.map((month) => (
            <Accordion key={month} disableGutters elevation={0} sx={{ mb: 1.5, borderRadius: '12px !important', border: '1px solid #e2e8f0', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'warning.main' }} />} sx={{ px: 2 }}>
                <Typography fontWeight="700" variant="body1">{month}</Typography>
                <Chip label={`${groupedLeaves[month].length}`} size="small" variant="outlined" sx={{ ml: 1.5, fontWeight: 700, height: 20, fontSize: '0.75rem' }} />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {isMobile ? (
                  // Mobile Leave UI
                  <Box>
                    {groupedLeaves[month].sort((a, b) => new Date(b.date) - new Date(a.date)).map((rec) => (
                      <Box key={rec._id} sx={{ p: 2, borderBottom: '1px solid #f1f5f9' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="body2" fontWeight="700">{new Date(rec.date).toLocaleDateString()}</Typography>
                          <IconButton color="error" size="small" onClick={() => handleDelete(rec._id)} sx={{ bgcolor: '#fff1f2' }}>
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#475569', display: 'block', wordBreak: 'break-word' }}>
                          {rec.reason || "—"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  // Desktop Leave Table
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#fffbeb' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#92400e' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#92400e' }}>Reason</TableCell>
                          <TableCell align="right" sx={{ pr: 2 }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedLeaves[month].sort((a, b) => new Date(b.date) - new Date(a.date)).map((rec) => (
                          <TableRow key={rec._id} hover>
                            <TableCell sx={{ fontWeight: 700, py: 1.5 }}>{new Date(rec.date).toLocaleDateString()}</TableCell>
                            <TableCell sx={{ color: '#475569', fontSize: '0.85rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {rec.reason || "—"}
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 2 }}>
                              <IconButton color="error" size="small" onClick={() => handleDelete(rec._id)} sx={{ bgcolor: '#fff1f2', '&:hover': { bgcolor: '#ffe4e6' } }}>
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
      </Grid>

      {/* Modern Dialog - Responsive Padding */}
      <Dialog 
        open={leaveOpen} 
        onClose={() => setLeaveOpen(false)} 
        fullWidth 
        maxWidth="xs" 
        PaperProps={{ sx: { borderRadius: 4, p: { xs: 0.5, sm: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: '900', fontSize: '1.35rem' }}>New Leave Request</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <TextField fullWidth type="date" label="Effective Date" InputLabelProps={{ shrink: true }} value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth multiline rows={4} label="Brief Reason" placeholder="Explain your request..." value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setLeaveOpen(false)} color="inherit" sx={{ fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleLeaveApply} variant="contained" color="warning" sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TeacherSelfAttendance;