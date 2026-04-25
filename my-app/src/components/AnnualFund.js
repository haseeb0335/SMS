import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
    IconButton, TextField, Button, Typography, Paper, MenuItem, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Stack,
    Grid, Chip, InputAdornment, Card
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const BASE_URL = "https://sms-xi-rose.vercel.app";

const AnnualFund = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [fundRecords, setFundRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Form States
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");
    const [fundAmount, setFundAmount] = useState("");
    const [description, setDescription] = useState("Annual Fund 2026");
    const [receivedBy, setReceivedBy] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const schoolId = user?._id;

    const fetchData = useCallback(async () => {
        try {
            const [classRes, fundRes] = await Promise.all([
                axios.get(`${BASE_URL}/SclassList/${schoolId}`),
                axios.get(`${BASE_URL}/AnnualFundRecords`) // Calls the new specialized controller
            ]);
            setClasses(classRes.data);
            setFundRecords(fundRes.data);
        } catch (err) {
            console.error("Data Fetch Error:", err);
        }
    }, [schoolId]);

    useEffect(() => { if (schoolId) fetchData(); }, [schoolId, fetchData]);

    useEffect(() => {
        if (!selectedClass) return;
        axios.get(`${BASE_URL}/Sclass/Students/${selectedClass}`)
            .then(res => setStudents(res.data))
            .catch(err => console.error(err));
    }, [selectedClass]);

    const handleAddFund = async () => {
        if (!selectedStudent || !fundAmount || !receivedBy) {
            return toast.warning("Please fill all fields");
        }

        const studentObj = students.find(s => s._id === selectedStudent);
        const classObj = classes.find(c => c._id === selectedClass);

        const fundData = {
            studentId: selectedStudent,
            studentName: studentObj.name,
            fatherName: studentObj.fatherName,
            className: classObj.sclassName,
            amount: Number(fundAmount),
            feeMonth: description, // Fund Title
            receivedBy: receivedBy,
            date: new Date().toISOString()
        };

        try {
            // Updated to the new specific endpoint
            await axios.post(`${BASE_URL}/CollectAnnualFund`, fundData);
            toast.success("Annual Fund Collected Successfully!");
            setFundAmount("");
            fetchData(); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || "Error adding fund");
        }
    };

    const groupedFunds = useMemo(() => {
        const filtered = fundRecords.filter(f => 
            f.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.className?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.reduce((acc, curr) => {
            const cls = curr.className || "Other";
            if (!acc[cls]) acc[cls] = [];
            acc[cls].push(curr);
            return acc;
        }, {});
    }, [fundRecords, searchTerm]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <WorkspacePremiumIcon sx={{ fontSize: 40, color: '#2563eb' }} />
                <Typography variant="h4" fontWeight={900}>Annual Fund Management</Typography>
            </Stack>

            {/* Input Form Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <TextField select fullWidth label="Class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField select fullWidth label="Student" value={selectedStudent} disabled={!selectedClass} onChange={(e) => setSelectedStudent(e.target.value)}>
                            {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Collection Amount" type="number" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Description (Year)" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Collected By" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button variant="contained" fullWidth sx={{ height: '56px', fontWeight: 800, borderRadius: 2 }} onClick={handleAddFund}>
                            Submit Collection
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <TextField 
                placeholder="Search history by name or class..." 
                fullWidth sx={{ mb: 3, bgcolor: 'white' }}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />

            {/* Collection Records */}
            {Object.entries(groupedFunds).map(([className, records]) => (
                <Card key={className} sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={800}>{className}</Typography>
                        <Chip label={`Total: Rs. ${records.reduce((sum, r) => sum + r.amount, 0)}`} color="primary" />
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Fund Name</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {records.map((r) => (
                                    <TableRow key={r._id}>
                                        <TableCell sx={{ fontWeight: 600 }}>{r.studentName}</TableCell>
                                        <TableCell>{r.feeMonth}</TableCell>
                                        <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>Rs. {r.amount}</TableCell>
                                        <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="error" onClick={() => axios.put(`${BASE_URL}/DeleteFee/${r._id}`).then(fetchData)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            ))}
            <ToastContainer position="bottom-right" />
        </Box>
    );
};

export default AnnualFund;