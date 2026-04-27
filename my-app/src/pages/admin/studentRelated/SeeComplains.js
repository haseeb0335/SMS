import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Grid,
  Stack,
  Container,
  Divider
} from "@mui/material";

// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import GavelIcon from '@mui/icons-material/Gavel';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';

// const BASE_URL = "http://localhost:5000";
// const BASE_URL = "https://sms-xi-rose.vercel.app";
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://192.168.0.107:5000";

const SeeComplains = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [complains, setComplains] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [complainer, setComplainer] = useState("");
  const [complaint, setComplaint] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const schoolId = user?._id;

  // FETCH CLASSES
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);
        setClasses(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    if (schoolId) fetchClasses();
  }, [schoolId]);

  // FETCH STUDENTS
  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/Sclass/Students/${selectedClass}`);
        setStudents(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // FETCH COMPLAINS
  const fetchComplains = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/ComplainList/${schoolId}`);
      setComplains(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchComplains();
  }, []);

  // ADD COMPLAINT
  const handleSubmitComplaint = async () => {
    if (!selectedStudent || !complainer || !complaint) {
      alert("Please fill all fields");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/ComplainCreate`, {
        student: selectedStudent,
        complainer: complainer,
        complaint: complaint,
        school: schoolId,
        date: new Date()
      });
      setSelectedStudent("");
      setComplainer("");
      setComplaint("");
      fetchComplains();
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE COMPLAINT
  const handleDeleteComplaint = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/ComplainDelete/${id}`);
      setComplains((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        
        {/* FORM SECTION */}
        <Grid item xs={12} lg={4}>
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ p: 3, borderRadius: '20px', position: 'sticky', top: 20 }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: '10px', display: 'flex' }}>
                <GavelIcon sx={{ color: '#fff' }} />
              </Box>
              <Typography variant="h5" fontWeight="800">New Complaint</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Class"
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedStudent("");
                  }}
                  fullWidth
                >
                  {classes.length > 0 ? (
                    classes.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>{cls.sclassName}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No Classes Found</MenuItem>
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label="Student"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  fullWidth
                  disabled={!selectedClass}
                >
                  {students.length > 0 ? (
                    students.map((student) => (
                      <MenuItem key={student._id} value={student._id}>{student.name}</MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No Students Found</MenuItem>
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Complainer Name"
                  value={complainer}
                  onChange={(e) => setComplainer(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Complaint Description"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSubmitComplaint}
                  sx={{ py: 1.5, borderRadius: '10px', fontWeight: 'bold', textTransform: 'none' }}
                >
                  Log Complaint
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* LOGS SECTION */}
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ p: 3, borderRadius: '20px', minHeight: '80vh' }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Box sx={{ bgcolor: 'secondary.main', p: 1, borderRadius: '10px', display: 'flex' }}>
                <HistoryIcon sx={{ color: '#fff' }} />
              </Box>
              <Typography variant="h5" fontWeight="800">Complaint Records</Typography>
            </Stack>

            {complains.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography color="text.secondary">No complaints registered yet.</Typography>
              </Box>
            ) : (
              <TableContainer sx={{ borderRadius: '12px' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Complainer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Complaint</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {complains.map((c, index) => (
                      <TableRow key={c._id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                           <Stack direction="row" alignItems="center" spacing={1}>
                             <PersonIcon fontSize="small" color="primary" />
                             {c.student?.name}
                           </Stack>
                        </TableCell>
                        <TableCell>{c.complainer}</TableCell>
                        <TableCell sx={{ maxWidth: '250px' }}>
                          <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.complaint}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(c.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            onClick={() => handleDeleteComplaint(c._id)}
                            sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SeeComplains;