import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Container,
  Stack,
  Card,
  CardContent,
  Avatar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://sms-xi-rose.vercel.app";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5000";

function Test() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const schoolId = user?.school?._id;

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  // Fetch Classes
  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);

      const sortedClasses = (res.data || []).sort((a, b) =>
        a.sclassName.localeCompare(b.sclassName, undefined, { numeric: true })
      );

      setClasses(sortedClasses);
    } catch (err) {
      console.log("Error fetching classes:", err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      {/* HEADER SECTION */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={5}
      >
        <Box>
          <Typography variant="h3" fontWeight="900" color="primary" sx={{ letterSpacing: '-1.5px' }}>
            Tests
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Select a class to begin assessment.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => navigate("/teacher-quiz")}
          sx={{ 
            borderRadius: 3, 
            px: 3, 
            py: 1, 
            textTransform: 'none', 
            fontWeight: 700,
            boxShadow: '0 4px 14px 0 rgba(156, 39, 176, 0.39)' 
          }}
        >
          Create Quiz
        </Button>
      </Box>

      {/* CLASS SELECTION CARD */}
      <Card 
        sx={{ 
          borderRadius: 5, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.05)', 
          border: '1px solid #f1f5f9',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: 'primary.light', 
                width: 70, 
                height: 70, 
                mb: 1,
                boxShadow: '0 10px 20px rgba(25, 118, 210, 0.2)' 
              }}
            >
              <SchoolIcon sx={{ fontSize: 35, color: 'primary.main' }} />
            </Avatar>

            <Box textAlign="center" width="100%">
              <Typography variant="h5" fontWeight="800" gutterBottom>
                Classroom Selection
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Choose the specific class you want to manage tests for.
              </Typography>
            </Box>

            <TextField
              select
              fullWidth
              label="Active Classes"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 3,
                  backgroundColor: '#f8fafc'
                } 
              }}
            >
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.sclassName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Classes Found</MenuItem>
              )}
            </TextField>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!selectedClass}
              endIcon={<ArrowForwardIosIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ 
                borderRadius: 3, 
                height: 56, 
                textTransform: 'none', 
                fontWeight: 700, 
                fontSize: '1rem',
                mt: 1,
                boxShadow: selectedClass ? '0 10px 20px rgba(25, 118, 210, 0.2)' : 'none'
              }}
            >
              Continue to Dashboard
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* BOTTOM INFO */}
      <Box mt={4} textAlign="center">
        <Typography variant="caption" color="textDisabled" fontWeight="500">
          Selected School ID: {schoolId || "Not detected"}
        </Typography>
      </Box>
    </Container>
  );
}

export default Test;
