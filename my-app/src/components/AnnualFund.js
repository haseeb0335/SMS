import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
    IconButton, TextField, Button, Typography, Paper, MenuItem, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Stack,
    Grid, Card, CardContent, InputAdornment, useTheme, useMediaQuery
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
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

const BASE_URL = "https://sms-xi-rose.vercel.app";

const AnnualFund = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    const schoolName = user?.schoolName || "School System";

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

    const handleStudentChange = (studentId) => {
        setSelectedStudent(studentId);
        const student = students.find(s => s._id === studentId);
        if (student) {
            setFatherName(student.fatherName || "");
            setWhatsappNumber(student.phoneNum || ""); 
        }
    };

    const downloadPDF = (record) => {
        const doc = new jsPDF({ unit: "mm", format: [80, 150] });
        doc.setFontSize(14).text(schoolName, 40, 15, { align: "center" });
        doc.setFontSize(9).text("Annual Fund Receipt", 40, 22, { align: "center" });
        
        autoTable(doc, {
            startY: 28,
            body: [
                ["Student", record.studentName],
                ["Father", record.fatherName],
                ["Class", record.className],
                ["Fund Type", record.feeMonth],
                ["Amount", `Rs. ${record.amount}`],
                ["Date", new Date(record.date).toLocaleDateString()],
                ["Collector", record.collectorName || "Admin"]
            ],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 }
        });
        doc.save(`${record.studentName}_AnnualFund.pdf`);
    };

    const handleSubmission = async () => {
        if (!selectedStudent || !fundAmount) return toast.warning("Missing required fields");

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
                toast.success("Fund Collected Successfully!");
                
                if (whatsappNumber) {
                    const msg = `*ANNUAL FUND RECEIPT*%0A*School:* ${schoolName}%0A*Student:* ${data.studentName}%0A*Amount:* Rs. ${data.amount}%0A*Status:* Paid. Thank you!`;
                    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
                }
            }
            resetForm();
            fetchData();
        } catch (err) { toast.error("Operation failed"); }
    };

    const resetForm = () => {
        setEditId(null);
        setFundAmount("");
        setSelectedStudent("");
        setFatherName("");
        setWhatsappNumber("");
    };

    const groupedFunds = useMemo(() => {
        const filtered = fundRecords.filter(f => 
            f.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered.reduce((acc, curr) => {
            const cls = curr.className || "Other";
            if (!acc[cls]) acc[cls] = [];
            acc[cls].push(curr);
            return acc;
        }, {});
    }, [fundRecords, searchTerm]);

    // Format structure for Recharts dataset
    const computedChartData = useMemo(() => {
        return Object.keys(groupedFunds).map(cls => ({
            name: cls,
            total: groupedFunds[cls].reduce((s, r) => s + r.amount, 0)
        })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    }, [groupedFunds]);

    const overallTotal = useMemo(() => {
        return fundRecords.reduce((s, r) => s + r.amount, 0);
    }, [fundRecords]);

    return (
        <Box sx={{ p: { xs: 1.5, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Typography variant="h4" fontWeight={900} color="#1e293b" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <WorkspacePremiumIcon sx={{ fontSize: { xs: 28, sm: 36 }, color: '#3b82f6' }} /> Annual Fund Portal
            </Typography>

            {/* Dashboard Analytics Side-By-Side Header */}
            <Stack 
                direction="row" 
                spacing={{ xs: 1.5, md: 3 }} 
                sx={{ mb: 4, width: '100%', alignItems: 'stretch' }}
            >
                {/* Metrics Summary Box */}
                <Card sx={{ flex: 1, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, md: 3 }, '&:last-child': { pb: { xs: 1.5, md: 3 } } }}>
                        <WorkspacePremiumIcon sx={{ fontSize: { xs: 26, md: 40 }, color: '#3b82f6', mb: 0.5 }} />
                        <Typography color="textSecondary" variant="overline" fontWeight="800" sx={{ display: 'block', fontSize: { xs: '0.6rem', md: '0.75rem' }, lineHeight: 1.2, letterSpacing: 0.5 }}>Total Collected</Typography>
                        <Typography variant="h6" fontWeight="900" sx={{ color: '#0f172a', mt: 0.5, fontSize: { xs: '0.85rem', sm: '1.3rem', md: '1.65rem' }, whiteSpace: 'nowrap' }}>
                            Rs. {overallTotal.toLocaleString()}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Premium Micro-Sized Bar Chart */}
                <Paper sx={{ flex: { xs: 1.8, md: 2 }, p: { xs: 1.5, md: 2.5 }, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', height: { xs: 130, sm: 180, md: 220 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: { xs: '0.6rem', md: '0.75rem' } }}>Collection by Class</Typography>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={computedChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: isMobile ? 8 : 10, fontWeight: 600}} />
                            <YAxis axisLine={false} tickLine={false} hide />
                            <ChartTooltip cursor={{fill: 'rgba(59, 130, 246, 0.04)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', fontSize: '11px' }} />
                            <Bar dataKey="total" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={isMobile ? 12 : 16} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Stack>

            {/* Input Form Fields Box */}
            <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}><TextField select fullWidth label="Class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>{classes.map(c => <MenuItem key={c._id} value={c._id}>{c.sclassName}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={12} md={3}><TextField select fullWidth label="Student" value={selectedStudent} onChange={e => handleStudentChange(e.target.value)} disabled={!selectedClass}>{students.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</TextField></Grid>
                    <Grid item xs={12} md={3}><TextField fullWidth label="Father Name" value={fatherName} onChange={e => setFatherName(e.target.value)} /></Grid>
                    <Grid item xs={12} md={3}><TextField fullWidth label="WhatsApp Number" placeholder="923001234567" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} /></Grid>
                    <Grid item xs={12} md={4}><TextField fullWidth label="Amount" type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} /></Grid>
                    <Grid item xs={12} md={4}><TextField fullWidth label="Collector Name" value={collectorName} onChange={e => setCollectorName(e.target.value)} /></Grid>
                    <Grid item xs={12} md={4}>
                        <Button variant="contained" fullWidth sx={{ height: 56, borderRadius: '12px', fontWeight: 700, textTransform: 'none', bgcolor: '#3b82f6', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }} onClick={handleSubmission} startIcon={<WhatsAppIcon />}>
                            {editId ? "Update Record" : "Submit & Notify"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Search filter wrapper input */}
            <TextField 
                placeholder="Search Students..." 
                fullWidth 
                sx={{ mb: 3, bgcolor: 'white', borderRadius: '12px', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
                onChange={e => setSearchTerm(e.target.value)} 
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} 
            />

            {/* Render Lists nested collections */}
            {Object.entries(groupedFunds).map(([className, records]) => (
                <Card key={className} sx={{ mb: 3, borderRadius: '16px', overflow: 'hidden', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={800} color="#0f172a">{className}</Typography>
                        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                            Collector: {records[0]?.collectorName || "Admin"}
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: '700', color: '#64748b', py: 1.5 }}>Student / Father</TableCell>
                                    <TableCell sx={{ fontWeight: '700', color: '#64748b', py: 1.5 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: '700', color: '#64748b', py: 1.5 }}>Amount</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '700', color: '#64748b', py: 1.5 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {records.map((r) => (
                                    <TableRow key={r._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography variant="body2" fontWeight={700} color="#0f172a">{r.studentName}</Typography>
                                            <Typography variant="caption" color="textSecondary">S/O: {r.fatherName}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, fontWeight: '500', color: '#334155' }}>{new Date(r.date).toLocaleDateString()}</TableCell>
                                        <TableCell sx={{ py: 1.5, fontWeight: 800, color: '#10b981' }}>Rs. {r.amount}</TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                <IconButton color="primary" onClick={() => { setEditId(r._id); handleStudentChange(r.studentId); setFundAmount(r.amount); window.scrollTo({ top: 0, behavior: 'smooth' }); }} sx={{ p: 1 }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton color="secondary" onClick={() => downloadPDF(r)} sx={{ p: 1 }}>
                                                    <PictureAsPdfIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => axios.put(`${BASE_URL}/DeleteFee/${r._id}`).then(fetchData)} sx={{ p: 1 }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
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