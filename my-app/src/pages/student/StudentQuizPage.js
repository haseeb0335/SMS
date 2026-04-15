import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Button, Radio, RadioGroup, FormControlLabel, Divider, Alert } from "@mui/material";

function StudentQuizPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const classId = user.sclassName._id || user.sclassName;
      const res = await axios.get(`http://localhost:5000/getQuiz/${classId}`);
      
      // DISAPPEAR LOGIC: Hide quizzes already in the student's results
      const takenQuizzes = user.quizResults?.map(r => r.quizTitle) || [];
      const available = res.data.filter(q => !takenQuizzes.includes(q.title));
      setQuizzes(available);
    } catch (err) { console.error(err); }
  };

 const handleSubmit = async () => {
  try {
    const res = await axios.post("http://localhost:5000/submitQuiz", {
      studentId: user._id,
      quizId: currentQuiz._id,
      answers: answers
    });

    // --- SAFETY CHECK START ---
    const updatedUser = { ...user };
    
    // If quizResults doesn't exist yet, initialize it as an empty array
    if (!updatedUser.quizResults) {
      updatedUser.quizResults = [];
    }

    updatedUser.quizResults.push({
      quizTitle: currentQuiz.title,
      score: res.data.score,
      total: res.data.total,
      date: new Date()
    });
    
    // Save back to local storage
    localStorage.setItem("user", JSON.stringify(updatedUser));
    // --- SAFETY CHECK END ---

    setScoreResult(res.data);
  } catch (err) {
    console.error(err);
    alert("Submission Error. Check console.");
  }
};
  if (scoreResult) {
    const isPass = (scoreResult.score / scoreResult.total) * 100 >= 50;
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h3" color={isPass ? "green" : "red"} fontWeight="bold">
          {isPass ? "PASSED" : "FAILED"}
        </Typography>
        <Typography variant="h5" sx={{ my: 2 }}>Your Score: {scoreResult.score} / {scoreResult.total}</Typography>
        <Alert severity={isPass ? "success" : "error"} sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
          {isPass ? "Great job! You cleared the quiz." : "You did not reach the 50% pass mark."}
        </Alert>
        <Button variant="contained" onClick={() => { setScoreResult(null); setCurrentQuiz(null); fetchQuizzes(); }}>
          Return to Quizzes
        </Button>
      </Box>
    );
  }

  if (!currentQuiz) {
    return (
      <Box p={4}>
        <Typography variant="h4" mb={3} fontWeight="bold">Your Exams</Typography>
        {quizzes.length === 0 ? <Typography>No new quizzes available.</Typography> : 
          quizzes.map((q) => (
            <Paper key={q._id} sx={{ p: 3, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">{q.title}</Typography>
              <Button variant="contained" onClick={() => setCurrentQuiz(q)}>Start Quiz</Button>
            </Paper>
          ))
        }
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" mb={4}>{currentQuiz.title}</Typography>
      {currentQuiz.questions.map((q, idx) => (
        <Paper key={idx} sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6">{idx + 1}. {q.question}</Typography>
          <RadioGroup onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}>
            {q.options.map((opt, oIdx) => (
              <FormControlLabel key={oIdx} value={opt} control={<Radio />} label={opt} />
            ))}
          </RadioGroup>
        </Paper>
      ))}
      <Button variant="contained" color="success" fullWidth onClick={handleSubmit} sx={{ mt: 3, py: 2 }}>
        Submit Quiz
      </Button>
    </Box>
  );
}

export default StudentQuizPage;