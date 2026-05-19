import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TextField, Button, 
    Stack, Chip, IconButton, Card, CardContent, useTheme, useMediaQuery
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import axios from 'axios';

const BASE_URL = "https://sms-xi-rose.vercel.app";

const ExamFees = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [feeData, setFeeData] = useState({
        className: '',
        examType: 'Final Term',
        amount: ''
    });
    const [records, setRecords] = useState([]);

    // Fetch existing structures
    const fetchFees = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/ExamFees`);
            setRecords(res.data);
        } catch (err) {
            console.error("Error fetching fees:", err);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    // Derived statistics and chart calculations for structures
    const stats = useMemo(() => {
        const total = records.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        
        const classData = records.reduce((acc, r) => {
            const amount = Number(r.amount || 0);
            const name = r.className.trim().toUpperCase();
            acc[name] = (acc[name] || 0) + amount;
            return acc;
        }, {});

        const chartData = Object.keys(classData).map(cls => ({
            name: cls,
            total: classData[cls]
        })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        return { total, chartData };
    }, [records]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Normalizing class name (removing extra spaces)
            const normalizedData = {
                ...feeData,
                className: feeData.className.trim().toLowerCase()
            };
            
            await axios.post(`${BASE_URL}/ExamFees`, normalizedData);
            setFeeData({ className: '', examType: 'Final Term', amount: '' });
            fetchFees(); // Refresh list
        } catch (err) {
            alert("Error saving fee structure");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this fee structure?")) {
            try {
                await axios.delete(`${BASE_URL}/ExamFee/${id}`);
                fetchFees();
            } catch (err) {
                alert("Error deleting structure");
            }
        }
    };

    return (
        <Box sx={{ p: { xs: 1.5, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Typography variant="h4" fontWeight="900" color="#1e293b" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, mb: 3 }}>
                Examination Fee Structure
            </Typography>
            
            {/* Dashboard Analytics Side-By-Side Header */}
            <Stack 
                direction="row" 
                spacing={{ xs: 1.5, md: 3 }} 
                sx={{ mb: 4, width: '100%', alignItems: 'stretch' }}
            >
                {/* Structure Value Summary Card */}
                <Card sx={{ flex: 1, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, md: 3 }, '&:last-child': { pb: { xs: 1.5, md: 3 } } }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: { xs: 26, md: 40 }, color: '#6366f1', mb: 0.5 }} />
                        <Typography color="textSecondary" variant="overline" fontWeight="800" sx={{ display: 'block', fontSize: { xs: '0.6rem', md: '0.75rem' }, lineHeight: 1.2, letterSpacing: 0.5 }}>Combined Value</Typography>
                        <Typography variant="h6" fontWeight="900" sx={{ color: '#0f172a', mt: 0.5, fontSize: { xs: '0.85rem', sm: '1.3rem', md: '1.65rem' }, whiteSpace: 'nowrap' }}>
                            RS {stats.total.toLocaleString()}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Premium Micro-Sized Bar Chart Component */}
                <Paper sx={{ flex: { xs: 1.8, md: 2 }, p: { xs: 1.5, md: 2.5 }, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', height: { xs: 130, sm: 180, md: 220 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: { xs: '0.6rem', md: '0.75rem' } }}>Structure Value by Class</Typography>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: isMobile ? 8 : 10, fontWeight: 600}} />
                            <YAxis axisLine={false} tickLine={false} hide />
                            <ChartTooltip cursor={{fill: 'rgba(99, 102, 241, 0.04)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', fontSize: '11px' }} />
                            <Bar dataKey="total" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={isMobile ? 12 : 16} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Stack>

            {/* Structure Entry Form Layout */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <form onSubmit={handleSubmit}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField 
                            fullWidth
                            label="Class (e.g. 10th)" 
                            required 
                            value={feeData.className}
                            onChange={(e) => setFeeData({...feeData, className: e.target.value})}
                        />
                        <TextField 
                            fullWidth
                            select 
                            label="Exam Type" 
                            SelectProps={{ native: true }}
                            value={feeData.examType}
                            onChange={(e) => setFeeData({...feeData, examType: e.target.value})}
                        >
                            <option value="Mid Term">Mid Term</option>
                            <option value="Final Term">Final Term</option>
                            <option value="Monthly Test">Monthly Test</option>
                        </TextField>
                        <TextField 
                            fullWidth
                            label="Amount" 
                            type="number" 
                            required
                            value={feeData.amount}
                            onChange={(e) => setFeeData({...feeData, amount: e.target.value})}
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                            sx={{ bgcolor: '#1e293b', px: 4, py: { xs: 1.5, md: 'auto' }, borderRadius: '12px', textTransform: 'none', fontWeight: '700', boxShadow: 'none', '&:hover': { bgcolor: '#0f172a', boxShadow: 'none' } }}
                        >
                            Update Structure
                        </Button>
                    </Stack>
                </form>
            </Paper>

            {/* Structured Table Layout Wrapper */}
            <TableContainer component={Paper} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell sx={{ fontWeight: '700', color: '#64748b', py: 2 }}>Class</TableCell>
                            <TableCell sx={{ fontWeight: '700', color: '#64748b', py: 2 }}>Exam Category</TableCell>
                            <TableCell sx={{ fontWeight: '700', color: '#64748b', py: 2 }}>Fee Amount</TableCell>
                            <TableCell sx={{ fontWeight: '700', color: '#64748b', py: 2 }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: '700', color: '#64748b', py: 2 }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                                    No structure details documented yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((row) => (
                                <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ textTransform: 'capitalize', fontWeight: '700', color: '#0f172a' }}>{row.className}</TableCell>
                                    <TableCell sx={{ fontWeight: '500', color: '#334155' }}>{row.examType}</TableCell>
                                    <TableCell sx={{ fontWeight: '800', color: '#10b981' }}>RS {Number(row.amount).toLocaleString()}</TableCell>
                                    <TableCell><Chip label="Active" color="success" size="small" sx={{ borderRadius: '6px', fontWeight: '700' }} /></TableCell>
                                    <TableCell align="center">
                                        <IconButton color="error" onClick={() => handleDelete(row._id)} sx={{ p: 1.2 }}>
                                            <DeleteIcon sx={{ fontSize: '1.2rem' }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ExamFees;