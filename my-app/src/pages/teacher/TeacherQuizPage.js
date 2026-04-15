import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, TextField, Button, MenuItem, Paper,
  IconButton, Table, TableHead, TableRow, TableCell, TableBody,
  Divider, Card, CardContent, Chip, Tooltip, Container, Stack,
  TableContainer, Grid
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import SaveIcon from '@mui/icons-material/Save';

const BASE_URL = "http://localhost:5000";

function TeacherQuizPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const schoolId = user?.school?._id;

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [quizRecords, setQuizRecords] = useState([]);
  const [studentScores, setStudentScores] = useState([]);
  const [editId, setEditId] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (schoolId) fetchClasses();
  }, [schoolId]);

  useEffect(() => {
    if (selectedClass) fetchAllData();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);
      setClasses(res.data || []);
      if (res.data.length > 0) setSelectedClass(res.data[0]._id);
    } catch (err) { console.error("Error fetching classes:", err); }
  };

  const fetchAllData = async () => {
    try {
      const [quizRes, scoreRes] = await Promise.all([
        axios.get(`${BASE_URL}/getQuiz/${selectedClass}`),
        axios.get(`${BASE_URL}/Sclass/Students/${selectedClass}`)
      ]);
      setQuizRecords(quizRes.data);
      setStudentScores(scoreRes.data);
    } catch (err) { console.error("Error fetching data:", err); }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }]);
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle || questions.length === 0) return alert("Please fill all fields");
    const payload = { title: quizTitle, className: selectedClass, questions };
    try {
      if (editId) await axios.put(`${BASE_URL}/updateQuiz/${editId}`, payload);
      else await axios.post(`${BASE_URL}/createQuiz`, payload);
      resetForm();
      fetchAllData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm("Delete this quiz entirely?")) {
      await axios.delete(`${BASE_URL}/deleteQuiz/${id}`);
      fetchAllData();
    }
  };

  const handleDeleteResult = async (studentId, resultId) => {
    try {
      await axios.delete(`${BASE_URL}/deleteQuizResult/${studentId}/${resultId}`);
      fetchAllData(); 
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setQuizTitle("");
    setQuestions([]);
  };

  const filteredQuizzes = quizRecords.filter(q => new Date(q.date).getMonth() === selectedMonth);

  const leaderBoard = studentScores
    .flatMap(student => 
      (student.quizResults || []).map(res => ({ 
        studentId: student._id, 
        name: student.name, 
        ...res 
      }))
    )
    .filter(res => new Date(res.date).getMonth() === selectedMonth)
    .sort((a, b) => b.score - a.score);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 5 } }}>
      {/* Header Section */}
      <Box mb={4} textAlign={{ xs: 'center', md: 'left' }}>
        <Typography variant="h3" fontWeight="900" color="primary" sx={{ letterSpacing: '-1px' }}>
          Quiz Central
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Design assessments, track performance, and reward excellence.
        </Typography>
      </Box>

      {/* Quiz Creation Form */}
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 5, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
           <AddCircleOutlineIcon color="primary" />
           <Typography variant="h5" fontWeight="800">{editId ? "Edit Quiz" : "Create New Quiz"}</Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
             <TextField select label="Target Class" fullWidth value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}>
               {classes.map(cls => <MenuItem key={cls._id} value={cls._id}>{cls.sclassName}</MenuItem>)}
             </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
             <TextField label="Quiz Title (e.g. Midterm Physics)" fullWidth value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          </Grid>
        </Grid>
        
        <Box mt={3}>
          {questions.map((q, idx) => (
            <Card key={idx} variant="outlined" sx={{ mb: 3, borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'visible' }}>
              <Box sx={{ bgcolor: '#f8fafc', p: 1, px: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" fontWeight="900" color="textSecondary">QUESTION {idx + 1}</Typography>
              </Box>
              <CardContent>
                <TextField label="Ask your question..." fullWidth size="small" value={q.question} onChange={(e) => {
                  const newQ = [...questions]; newQ[idx].question = e.target.value; setQuestions(newQ);
                }} sx={{ mb: 2 }} />
                
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2} mb={2}>
                  {q.options.map((opt, oi) => (
                    <TextField key={oi} label={`Option ${oi + 1}`} size="small" value={opt} onChange={(e) => {
                      const newQ = [...questions]; newQ[idx].options[oi] = e.target.value; setQuestions(newQ);
                    }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  ))}
                </Box>

                <TextField select label="Identify Correct Answer" fullWidth size="small" value={q.correctAnswer} onChange={(e) => {
                  const newQ = [...questions]; newQ[idx].correctAnswer = e.target.value; setQuestions(newQ);
                }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  {q.options.map((opt, i) => <MenuItem key={i} value={opt}>{opt || `Option ${i+1}`}</MenuItem>)}
                </TextField>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
          <Button fullWidth onClick={addQuestion} variant="outlined" startIcon={<QuizIcon />} sx={{ borderRadius: 3, height: 50, fontWeight: 700, textTransform: 'none' }}>Add Question</Button>
          <Button fullWidth onClick={handleSaveQuiz} variant="contained" startIcon={<SaveIcon />} color={editId ? "secondary" : "primary"} sx={{ borderRadius: 3, height: 50, fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}>
            {editId ? "Update Quiz Content" : "Publish Quiz"}
          </Button>
          {editId && <Button fullWidth onClick={resetForm} color="inherit" sx={{ fontWeight: 700 }}>Discard Changes</Button>}
        </Stack>
      </Paper>

      {/* Management Section */}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={5}>
           <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="800">Monthly Log</Typography>
              <TextField select size="small" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                {months.map((m, i) => <MenuItem key={i} value={i}>{m}</MenuItem>)}
              </TextField>
           </Box>
           
           <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuizzes.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.disabled' }}>No quizzes this month</TableCell></TableRow>
                ) : filteredQuizzes.map(q => (
                  <TableRow key={q._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700">{q.title}</Typography>
                      <Typography variant="caption" color="textSecondary">{new Date(q.date).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => { setEditId(q._id); setQuizTitle(q.title); setQuestions(q.questions); }} color="primary" size="small"><EditIcon fontSize="small" /></IconButton>
                      <IconButton onClick={() => handleDeleteQuiz(q._id)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Typography variant="h5" fontWeight="800" mb={3} display="flex" alignItems="center">
            <EmojiEventsIcon sx={{ color: "#ffc107", mr: 1 }} /> Hall of Fame
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #f0f0f0', boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: "#eff6ff" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderBoard.map((res, i) => (
                  <TableRow key={res._id || i} sx={{ bgcolor: i === 0 ? "#fffdec" : "transparent" }}>
                    <TableCell>
                      {i === 0 ? <EmojiEventsIcon sx={{ color: '#ffc107' }} /> : <strong>#{i + 1}</strong>}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700">{res.name}</Typography>
                      <Typography variant="caption" color="textSecondary">{res.quizTitle}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${res.score}/${res.total}`} 
                        size="small"
                        sx={{ fontWeight: 800, borderRadius: 1.5, bgcolor: res.score === res.total ? '#dcfce7' : '#f1f5f9', color: res.score === res.total ? '#166534' : 'inherit' }} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleDeleteResult(res.studentId, res._id)} color="error" size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {leaderBoard.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.disabled' }}>No results recorded yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TeacherQuizPage;