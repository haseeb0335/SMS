import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
    IconButton, TextField, Button, Typography, Paper, MenuItem, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Stack,
    Grid, Chip, InputAdornment, Card
} from "@mui/material";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SearchIcon from "@mui/icons-material/Search";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BASE_URL = "https://sms-xi-rose.vercel.app";

const AnnualFund = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [fundRecords, setFundRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Form States
    const [editId, setEditId] = useState(null);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [fundAmount, setFundAmount] = useState("");
    const [collectorName, setCollectorName] = useState("");
    const [description, setDescription] = useState("Annual Fund 2026");

    const user = JSON.parse(localStorage.getItem("user"));
    const schoolId = user?._id;
    const schoolName = user?.schoolName || "My School System";

    const fetchData = useCallback(async () => {
        try {
            const [classRes, fundRes] = await Promise.all([
                axios.get(`${BASE_URL}/SclassList/${schoolId}`),
                axios.get(`${BASE_URL}/AnnualFundRecords`)
            ]);
            setClasses(classRes.data);
            setFundRecords(fundRes.data);
        } catch (err) { console.error(err); }
    }, [schoolId]);

    useEffect(() => { if (schoolId) fetchData(); }, [schoolId, fetchData]);

    useEffect(() => {
        if (!selectedClass) return;
        axios.get(`${BASE_URL}/Sclass/Students/${selectedClass}`).then(res => setStudents(res.data));
    }, [selectedClass]);

    const handleEditInitiate = (record) => {
        setEditId(record._id);
        const cls = classes.find(c => c.sclassName === record.className);
        setSelectedClass(cls?._id || "");
        setSelectedStudent(record.studentId);
        setFatherName(record.fatherName);
        setFundAmount(record.amount);
        setCollectorName(record.collectorName || "");
        setDescription(record.feeMonth);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmission = async () => {
        if (!selectedStudent || !fundAmount) return toast.warning("Required fields missing");

        const studentObj = students.find(s => s._id === selectedStudent);
        const classObj = classes.find(c => c._id === selectedClass);

        const data = {
            studentId: selectedStudent,
            studentName: studentObj?.name,
            fatherName,
            className: classObj?.sclassName,
            amount: Number(fundAmount),
            feeMonth: description,
            collectorName,
            receivedBy: user?.name || "Admin",
            date: new Date().toISOString()
        };

        try {
            if (editId) {
                await axios.put(`${BASE_URL}/EditAnnualFund/${editId}`, data);
                toast.success("Record Updated");
            } else {
                await axios.post(`${BASE_URL}/CollectAnnualFund`, data);
                toast.success("Fund Collected");
                // Auto-WhatsApp only on new collection
                const msg = `*ANNUAL FUND RECEIPT*%0A*Student:* ${data.studentName}%0A*Amount:* Rs.${data.amount}`;
                window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
            }
            resetForm();
            fetchData();
        } catch (err) { toast.error("Action failed"); }
    };

    const resetForm = () => {
        setEditId(null);
        setFundAmount("");
        setFatherName("");
        setWhatsappNumber("");
    };

    const groupedFunds = useMemo(() => {
        return fundRecords.reduce((acc, curr) => {
            const cls = curr.className || "Other";
            if (!acc[cls]) acc[cls] = [];
            acc[cls].push(curr);
            return acc;
        }, {});
    }, [fundRecords]);

    const chartData = {
        labels: Object.keys(groupedFunds),
        datasets: [{
            label: 'Collection by Class',
            data: Object.values(groupedFunds).map(recs => recs.reduce((s, r) => s + r.amount, 0)),
            backgroundColor: '#2563eb',
            borderRadius: 5
        }]
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Typography variant="h4" fontWeight={900} gutterBottom>Annual Fund Dashboard</Typography>

            {/* Analytics Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: 300 }}>
                        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, bgcolor: '#1e293b', color: 'white', borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6">Total Collection</Typography>
                        <Typography variant="h3" fontWeight={900}>Rs. {fundRecords.reduce((s, r) => s + r.amount, 0)}</Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Input Form */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}><TextField fullWidth label="Collector Name" value={collectorName} onChange={e => setCollectorName(e.target.value)} /></Grid>
                    <Grid item xs={12} md={3}><TextField select fullWidth label="Class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>{classes.map(c => <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={12} md={3}><TextField select fullWidth label="Student" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>{students.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={12} md={3}><TextField fullWidth label="Amount" type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} /></Grid>
                    <Grid item xs={12} md={12}><Button variant="contained" fullWidth sx={{ height: 50 }} onClick={handleSubmission}>{editId ? "Update Record" : "Submit & Send WhatsApp"}</Button></Grid>
                </Grid>
            </Paper>

            {/* Records List */}
            {Object.entries(groupedFunds).map(([className, records]) => (
                <Card key={className} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight={800}>{className}</Typography>
                        <Typography color="primary" fontWeight={700}>Collector: {records[0]?.collectorName || "Admin"}</Typography>
                    </Box>
                    <TableContainer>
                        <Table size="small">
                            <TableHead><TableRow><TableCell>Student/Father</TableCell><TableCell>Date</TableCell><TableCell>Amount</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                            <TableBody>
                                {records.map((r) => (
                                    <TableRow key={r._id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700}>{r.studentName}</Typography>
                                            <Typography variant="caption" color="textSecondary">S/O: {r.fatherName}</Typography>
                                        </TableCell>
                                        <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                                        <TableCell sx={{ fontWeight: 800 }}>Rs. {r.amount}</TableCell>
                                        <TableCell align="right">
                                            <IconButton color="primary" onClick={() => handleEditInitiate(r)}><EditIcon fontSize="small" /></IconButton>
                                            <IconButton color="error" onClick={() => axios.put(`${BASE_URL}/DeleteFee/${r._id}`).then(fetchData)}><DeleteIcon fontSize="small" /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            ))}
            <ToastContainer />
        </Box>
    );
};

export default AnnualFund;