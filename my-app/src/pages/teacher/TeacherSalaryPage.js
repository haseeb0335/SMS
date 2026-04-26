import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Paper, Typography, Table, TableHead, TableRow, TableCell, 
  TableBody, Chip, Box, Grid, Card, CardContent, Divider,
  Container, TableContainer, Avatar, Stack
} from "@mui/material";
import PaidIcon from '@mui/icons-material/Paid';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const TeacherSalaryPage = () => {
  const [mySalaries, setMySalaries] = useState([]);
  const [latestSalary, setLatestSalary] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  // const BASE_URL = "http://localhost:5000";
// const BASE_URL = "https://sms-xi-rose.vercel.app";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5000";

  useEffect(() => {
    const fetchMySalaries = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/TeacherSalaries/${currentUser._id}`);
        setMySalaries(res.data);
        if (res.data.length > 0) {
          setLatestSalary(res.data[0]); 
        }
      } catch (err) {
        console.error("Error fetching teacher salaries:", err);
      }
    };

    if (currentUser?._id) {
      fetchMySalaries();
    }
  }, [currentUser?._id]);

  return (
    <Box sx={{ py: { xs: 2, md: 6 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Container maxWidth="lg">
        {/* HEADER SECTION */}
        <Grid container spacing={3} mb={{ xs: 3, md: 6 }} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 }, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)' }}>
                <AccountBalanceWalletIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="900" color="primary" sx={{ letterSpacing: '-1px', fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                  Salaries
                </Typography>
                <Typography variant="body2" color="textSecondary" fontWeight="500">
                  Payment records for {currentUser?.name}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                color: "white", 
                borderRadius: 4, 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>
                    Latest Payment
                  </Typography>
                  <PaidIcon sx={{ opacity: 0.5 }} />
                </Box>
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 900, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                  {latestSalary ? `Rs ${latestSalary.amount.toLocaleString()}` : "Rs 0"}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, fontWeight: 500 }}>
                  {latestSalary ? `Released for ${latestSalary.month} ${latestSalary.year}` : "No recent data"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* TRANSACTION HISTORY SECTION */}
        <Box mb={2} display="flex" alignItems="center" gap={1}>
          <HistoryIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight="800">History</Typography>
        </Box>

        {/* DESKTOP VIEW: TABLE */}
        <Paper 
          sx={{ 
            display: { xs: 'none', md: 'block' },
            borderRadius: 4, 
            overflow: 'hidden',
            border: '1px solid #f1f5f9',
            boxShadow: 'none'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>MONTH/YEAR</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>AMOUNT</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>DATE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#64748b' }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mySalaries.map((salary, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{salary.month} {salary.year}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>Rs {salary.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(salary.date).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Chip label="Paid" size="small" sx={{ fontWeight: 800, bgcolor: '#dcfce7', color: '#166534' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* MOBILE VIEW: CARDS */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          {mySalaries.length > 0 ? (
            mySalaries.map((salary, index) => (
              <Card key={index} sx={{ mb: 2, borderRadius: 3, border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="800" color="#1e293b">
                        {salary.month} {salary.year}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ opacity: 0.6 }}>
                        <CalendarTodayIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption">{new Date(salary.date).toLocaleDateString()}</Typography>
                      </Stack>
                    </Box>
                    <Chip label="Paid" size="small" sx={{ fontWeight: 800, bgcolor: '#dcfce7', color: '#166534', height: 20, fontSize: '0.65rem' }} />
                  </Box>
                  <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="textSecondary" fontWeight="600">Net Paid:</Typography>
                    <Typography variant="h6" fontWeight="900" color="primary.main">
                      Rs {salary.amount.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: '#f8fafc' }}>
              <Typography variant="body2" color="textDisabled">No records found.</Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default TeacherSalaryPage;