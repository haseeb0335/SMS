import React, { useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TextField, Button, 
    Stack, Chip 
} from '@mui/material';

const ExamFees = () => {
    const [feeData, setFeeData] = useState({
        className: '',
        examType: 'Final Term',
        amount: ''
    });
    const [records, setRecords] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setRecords([...records, feeData]);
        setFeeData({ className: '', examType: 'Final Term', amount: '' });
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" color="primary" gutterBottom>Examination Fee Structure</Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Stack direction="row" spacing={2}>
                        <TextField 
                            label="Class (e.g. 10th)" 
                            required 
                            value={feeData.className}
                            onChange={(e) => setFeeData({...feeData, className: e.target.value})}
                        />
                        <TextField 
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
                            label="Amount" 
                            type="number" 
                            required
                            value={feeData.amount}
                            onChange={(e) => setFeeData({...feeData, amount: e.target.value})}
                        />
                        <Button type="submit" variant="contained" color="secondary">Update Structure</Button>
                    </Stack>
                </form>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Class</TableCell>
                            <TableCell>Exam Category</TableCell>
                            <TableCell>Fee Amount</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.map((row, i) => (
                            <TableRow key={i}>
                                <TableCell>{row.className}</TableCell>
                                <TableCell>{row.examType}</TableCell>
                                <TableCell>RS {row.amount}</TableCell>
                                <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ExamFees;