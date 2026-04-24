import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TextField, Button, 
    Stack, Chip, IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const BASE_URL = "https://sms-xi-rose.vercel.app";

const ExamFees = () => {
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
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Typography variant="h4" fontWeight="800" color="#1e293b" gutterBottom>
                Examination Fee Structure
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <form onSubmit={handleSubmit}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                            sx={{ bgcolor: '#1e293b', px: 4, borderRadius: '12px', textTransform: 'none' }}
                        >
                            Update Structure
                        </Button>
                    </Stack>
                </form>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                            <TableCell sx={{ fontWeight: '700' }}>Class</TableCell>
                            <TableCell sx={{ fontWeight: '700' }}>Exam Category</TableCell>
                            <TableCell sx={{ fontWeight: '700' }}>Fee Amount</TableCell>
                            <TableCell sx={{ fontWeight: '700' }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: '700' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.map((row) => (
                            <TableRow key={row._id} hover>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{row.className}</TableCell>
                                <TableCell>{row.examType}</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#10b981' }}>RS {row.amount}</TableCell>
                                <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                                <TableCell align="center">
                                    <IconButton color="error" onClick={() => handleDelete(row._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ExamFees;