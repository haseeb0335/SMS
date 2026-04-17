import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
    IconButton, TextField, Button, Typography, Paper, MenuItem, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Stack,
    Grid, Card, CardContent, InputAdornment, useTheme, useMediaQuery
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import FilterListIcon from '@mui/icons-material/FilterList';
import SchoolIcon from '@mui/icons-material/School';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://sms-xi-rose.vercel.app";

const AddFees = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [feesList, setFeesList] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // FILTERS
    const [filterMonth, setFilterMonth] = useState("All");
    const [filterClass, setFilterClass] = useState("All");

    const user = JSON.parse(localStorage.getItem("user"));
    const schoolId = user?._id;

    const fetchAllFees = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/AllFees`);
            setFeesList(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/SclassList/${schoolId}`);
                setClasses(res.data);
            } catch (err) { console.error(err); }
        };
        if (schoolId) fetchClasses();
        fetchAllFees();
    }, [schoolId, fetchAllFees]);

    useEffect(() => {
        if (!selectedClass) return;
        const fetchStudents = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/Sclass/Students/${selectedClass}`);
                setStudents(res.data);
            } catch (err) { console.error(err); }
        };
        fetchStudents();
    }, [selectedClass]);

    const handleAddFee = async () => {
        if (!selectedStudent || !amount || !date) return toast.warning("Fill all fields");
        try {
            await axios.post(`${BASE_URL}/AddFees`, { 
                studentId: selectedStudent, 
                amount: Number(amount),
                date: date 
            });
            toast.success("Fee Added Successfully!");
            setAmount("");
            fetchAllFees();
        } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    };

    const handleDeleteFee = async (id) => {
        if (!window.confirm("Delete record?")) return;
        try {
            await axios.put(`${BASE_URL}/DeleteFee/${id}`);
            fetchAllFees();
            toast.info("Deleted");
        } catch (err) { console.error(err); }
    };

    const handleEditFee = async (fee) => {
        const newAmt = prompt("New Amount:", fee.amount);
        if (!newAmt) return;
        try {
            await axios.put(`${BASE_URL}/EditFee/${fee._id}`, { amount: Number(newAmt) });
            fetchAllFees();
            toast.success("Updated");
        } catch (err) { console.error(err); }
    };

    const downloadMonthlyPDF = (className, monthName, fees) => {
        const doc = new jsPDF();
        doc.setFontSize(18); doc.text(`Fee Report: ${className}`, 14, 15);
        doc.setFontSize(12); doc.text(`Month: ${monthName}`, 14, 22);
        const tableColumn = ["#", "Student Name", "Amount (PKR)", "Date"];
        const tableRows = fees.map((f, i) => [i + 1, f.studentName, `Rs. ${f.amount}`, new Date(f.date).toLocaleDateString()]);
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30, theme: 'striped', headStyles: { fillColor: [25, 118, 210] } });
        doc.save(`Fees_${className}_${monthName.replace(/\s+/g, '_')}.pdf`);
    };

    // Extract unique Class Names for the filter
    const availableClasses = useMemo(() => {
        const classNames = feesList.map(f => f.className || "Unassigned");
        return ["All", ...new Set(classNames)];
    }, [feesList]);

    // Extract unique Month-Year strings for the filter
    const availableMonths = useMemo(() => {
        const months = feesList.map(f => new Date(f.date).toLocaleString('default', { month: 'long', year: 'numeric' }));
        return ["All", ...new Set(months)];
    }, [feesList]);

    // Apply Double Filtering (Class + Month)
    const filteredGroupedFees = useMemo(() => {
        return feesList.reduce((acc, fee) => {
            const className = fee.className || "Unassigned";
            const monthYear = new Date(fee.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            
            // Check Class Filter
            if (filterClass !== "All" && className !== filterClass) return acc;
            // Check Month Filter
            if (filterMonth !== "All" && monthYear !== filterMonth) return acc;

            if (!acc[className]) acc[className] = {};
            if (!acc[className][monthYear]) acc[className][monthYear] = [];
            acc[className][monthYear].push(fee);
            return acc;
        }, {});
    }, [feesList, filterMonth, filterClass]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4 }}>
                <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 35 }} />
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' }}>
                    Fees Portal
                </Typography>
            </Stack>
            
            {/* Payment Entry Form */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 5, borderRadius: 4, border: '1px solid #e2e8f0', background: 'white' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#334155' }}>Payment Entry</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField select label="Class" value={selectedClass} fullWidth onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(""); }} InputProps={{ startAdornment: (<InputAdornment position="start"><GroupIcon color="primary" fontSize="small" /></InputAdornment>) }}>
                            {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField select label="Student" value={selectedStudent} fullWidth disabled={!selectedClass} onChange={(e) => setSelectedStudent(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon color="primary" fontSize="small" /></InputAdornment>) }}>
                            {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Amount" type="number" value={amount} fullWidth onChange={(e) => setAmount(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Typography sx={{ fontWeight: 'bold', color: '#10b981', fontSize: '0.9rem' }}>PKR</Typography></InputAdornment>) }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Date" type="date" value={date} fullWidth InputLabelProps={{ shrink: true }} onChange={(e) => setDate(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarTodayIcon color="action" fontSize="small" /></InputAdornment>) }} />
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button variant="contained" fullWidth={isMobile} onClick={handleAddFee} sx={{ px: 8, py: 1.5, borderRadius: '10px', textTransform: 'none', fontWeight: 700, background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' }}>Record Payment</Button>
                </Box>
            </Paper>

            {/* Filter Controls Row */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }} alignItems={{ md: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', flexGrow: 1 }}>Records History</Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {/* Class Filter Dropdown */}
                    <TextField 
                        select size="small" label="Filter Class" value={filterClass} 
                        onChange={(e) => setFilterClass(e.target.value)} sx={{ minWidth: 180, bgcolor: 'white' }}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SchoolIcon color="primary" fontSize="small" /></InputAdornment>) }}
                    >
                        {availableClasses.map(c => <MenuItem key={c} value={c}>{c === "All" ? "All Classes" : c}</MenuItem>)}
                    </TextField>

                    {/* Month Filter Dropdown */}
                    <TextField 
                        select size="small" label="Filter Month" value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)} sx={{ minWidth: 180, bgcolor: 'white' }}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><FilterListIcon color="primary" fontSize="small" /></InputAdornment>) }}
                    >
                        {availableMonths.map(m => <MenuItem key={m} value={m}>{m === "All" ? "All Months" : m}</MenuItem>)}
                    </TextField>
                </Stack>
            </Stack>

            {/* Displaying Filtered Results */}
            {Object.keys(filteredGroupedFees).length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, color: '#94a3b8' }}>
                    <Typography>No records found for the selected filters.</Typography>
                </Paper>
            ) : (
                Object.entries(filteredGroupedFees).map(([className, months]) => (
                    <Box key={className} sx={{ mb: 6 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 1 }} /> {className}
                        </Typography>
                        
                        {Object.entries(months).map(([month, fees]) => (
                            <Box key={month} sx={{ mb: 4, ml: { md: 2 } }}>
                                <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }} elevation={0}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', gap: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EventIcon color="action" fontSize="small" /> {month}
                                        </Typography>
                                        <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => downloadMonthlyPDF(className, month, fees)} sx={{ bgcolor: 'white', textTransform: 'none', fontWeight: 600 }}>PDF Report</Button>
                                    </Stack>

                                    <TableContainer>
                                        <Table>
                                            <TableHead sx={{ bgcolor: '#ffffff' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Amount (PKR)</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {fees.map((f, i) => (
                                                    <TableRow key={f._id} hover>
                                                        <TableCell>{i + 1}</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>{f.studentName}</TableCell>
                                                        <TableCell sx={{ color: '#10b981', fontWeight: 800 }}>Rs. {f.amount}</TableCell>
                                                        <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                                                        <TableCell align="right">
                                                            <IconButton onClick={() => handleEditFee(f)}><EditIcon color="primary" fontSize="small" /></IconButton>
                                                            <IconButton onClick={() => handleDeleteFee(f._id)}><DeleteIcon color="error" fontSize="small" /></IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                ))
            )}
            <ToastContainer position="bottom-center" autoClose={3000} theme="colored" />
        </Box>
    );
};

export default AddFees;

