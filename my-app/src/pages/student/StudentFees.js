import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Card, CardContent, 
    Grid, Container, Chip, Stack, Divider, Fade 
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5001";

const StudentFees = () => {
    const [fees, setFees] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));
    const studentId = user?._id;

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/Student/${studentId}`);
                setFees(res.data.fees || []);
            } catch (err) {
                console.error("Error fetching fees:", err);
            }
        };
        if (studentId) fetchStudentData();
    }, [studentId]);

    // Logic for Current Month Fees
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthFees = fees.filter(fee => {
        const feeDate = new Date(fee.date);
        return feeDate.getMonth() === currentMonth && feeDate.getFullYear() === currentYear;
    }).reduce((sum, fee) => sum + fee.amount, 0);

    const totalPaid = fees.reduce((sum, fee) => sum + fee.amount, 0);

    return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md">
                <Fade in={true}>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4 }}>
                            <AccountBalanceWalletIcon color="primary" />
                            <Typography variant="h5" fontWeight="900" sx={{ color: '#1E293B' }}>
                                Fee Management
                            </Typography>
                        </Stack>

                        <Grid container spacing={3} sx={{ mb: 5 }}>
                            <Grid item xs={12} sm={6}>
                                <Card sx={{ 
                                    borderRadius: '24px', 
                                    background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)', 
                                    color: 'white',
                                    boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)' 
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>Current Month Paid</Typography>
                                        <Typography variant="h3" fontWeight="900">Rs. {currentMonthFees}</Typography>
                                        <Chip 
                                            label={new Date().toLocaleString('default', { month: 'long' })} 
                                            size="small" 
                                            sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} 
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card sx={{ borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                                    {/* <CardContent sx={{ p: 3 }}>
                                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Total Lifetime Paid</Typography>
                                        <Typography variant="h3" fontWeight="900" sx={{ color: '#1E293B' }}>Rs. {totalPaid}</Typography>
                                        <Typography variant="caption" color="textSecondary">All records since enrollment</Typography>
                                    </CardContent> */}
                                </Card>
                            </Grid>
                        </Grid>

                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, px: 1 }}>
                            <HistoryIcon sx={{ color: '#64748B' }} />
                            <Typography variant="h6" fontWeight="800" color="#475569">Payment History</Typography>
                        </Stack>

                        {/* Desktop View Table */}
                        <TableContainer 
                            component={Paper} 
                            sx={{ 
                                display: { xs: 'none', md: 'block' },
                                borderRadius: '20px', 
                                border: '1px solid #E2E8F0', 
                                boxShadow: 'none',
                                overflow: 'hidden'
                            }}
                        >
                            <Table>
                                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '800' }}>Month/Year</TableCell>
                                        <TableCell sx={{ fontWeight: '800' }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: '800' }}>Date Paid</TableCell>
                                        <TableCell sx={{ fontWeight: '800' }} align="right">Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fees.length > 0 ? fees.map((fee, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                {new Date(fee.date).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell>Rs. {fee.amount}</TableCell>
                                            <TableCell>{new Date(fee.date).toLocaleDateString()}</TableCell>
                                            <TableCell align="right">
                                                <Chip 
                                                    icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />} 
                                                    label="PAID" 
                                                    color="success" 
                                                    variant="outlined" 
                                                    sx={{ fontWeight: 'bold', borderRadius: '8px' }} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={4} align="center">No records found</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Mobile View Cards */}
                        <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
                            {fees.length > 0 ? fees.map((fee, index) => (
                                <Card key={index} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Box>
                                                <Typography variant="h6" fontWeight="800">
                                                    {new Date(fee.date).toLocaleString('default', { month: 'long' })}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Year: {new Date(fee.date).getFullYear()}
                                                </Typography>
                                            </Box>
                                            <Chip label="PAID" color="success" size="small" sx={{ fontWeight: 900 }} />
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="textSecondary">Amount Paid:</Typography>
                                            <Typography variant="body2" fontWeight="700">Rs. {fee.amount}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mt={1}>
                                            <Typography variant="body2" color="textSecondary">Transaction Date:</Typography>
                                            <Typography variant="body2" fontWeight="700">{new Date(fee.date).toLocaleDateString()}</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )) : (
                                <Typography align="center" color="textSecondary">No fee records found.</Typography>
                            )}
                        </Stack>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default StudentFees;