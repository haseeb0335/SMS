import React, { useState, useMemo, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, TextField, Button, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Accordion, AccordionSummary, AccordionDetails, Card, CardContent
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Cell } from 'recharts';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

// Base URL for your deployed backend
const BASE_URL = "https://sms-xi-rose.vercel.app";

const AdmissionFees = () => {
    const [formData, setFormData] = useState({
        studentName: '', fatherName: '', dob: '', whatsapp: '',
        className: '', feeAmount: '', discount: '', 
        securityDeposit: '', annualFund: ''
    });
    
    const [records, setRecords] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

    // FETCH: Get all admissions from the DB
    const fetchAdmissions = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/Admissions`);
            setRecords(res.data);
        } catch (err) {
            console.error("Error fetching admissions:", err);
        }
    };

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const stats = useMemo(() => {
        const total = records.reduce((sum, r) => 
            sum + (Number(r.feeAmount) - Number(r.discount || 0) + Number(r.annualFund || 0)), 0);
        
        const classData = records.reduce((acc, r) => {
            const amount = Number(r.feeAmount) - Number(r.discount || 0) + Number(r.annualFund || 0);
            const name = r.className.trim().toUpperCase();
            acc[name] = (acc[name] || 0) + amount;
            return acc;
        }, {});

        return { 
            total, 
            chartData: Object.keys(classData).map(cls => ({ name: cls, total: classData[cls] })).sort((a, b) => a.name.localeCompare(b.name)) 
        };
    }, [records]);

    const COLORS = ['#1a237e', '#283593', '#303f9f', '#3949ab', '#3f51b5'];

    const sendWhatsAppMessage = (data) => {
        const phoneNumber = data.whatsapp.replace(/\D/g, ''); 
        if (!phoneNumber) return;
        const netTotal = Number(data.feeAmount) - Number(data.discount || 0) + Number(data.annualFund || 0);
        const message = `*ADMISSION SUCCESSFUL*%0A%0A*Student:* ${data.studentName}%0A*Class:* ${data.className}%0A*Total Paid:* RS ${netTotal}%0A%0AWelcome to our school!`;
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    const downloadOverallPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("YOUR SCHOOL NAME", 149, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text("Admission Records Summary", 14, 25);

        autoTable(doc, {
            startY: 30,
            head: [['Student', 'Father', 'Class', 'WA', 'Fee', 'Disc.', 'Annual', 'Security', 'Net Total']],
            body: records.map(r => [
                r.studentName, r.fatherName, r.className, r.whatsapp, r.feeAmount,
                r.discount || 0, r.annualFund || 0, r.securityDeposit || 0,
                (Number(r.feeAmount) - Number(r.discount || 0) + Number(r.annualFund || 0))
            ]),
        });
        doc.save("All_Admissions.pdf");
    };

    const downloadIndividualPDF = (student) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("YOUR SCHOOL NAME", 105, 20, { align: 'center' });
        doc.setFontSize(14);
        doc.text("Admission Receipt", 105, 30, { align: 'center' });

        autoTable(doc, {
            startY: 40,
            body: [
                ['Student Name', student.studentName],
                ['Father Name', student.fatherName],
                ['Class', student.className],
                ['Total Net Paid', `RS ${Number(student.feeAmount) - Number(student.discount || 0) + Number(student.annualFund || 0)}`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] }
        });
        doc.save(`${student.studentName}_Receipt.pdf`);
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isExactDuplicate = records.some((r, index) => 
            index !== editIndex && 
            r.studentName.trim().toLowerCase() === formData.studentName.trim().toLowerCase() && 
            r.fatherName.trim().toLowerCase() === formData.fatherName.trim().toLowerCase() &&
            r.className.trim().toLowerCase() === formData.className.trim().toLowerCase()
        );

        if (isExactDuplicate) {
            alert("This student is already registered in this specific class.");
            return;
        }

        try {
            if (editIndex !== null) {
                // UPDATE: PUT /api/Admission/:id
                const id = records[editIndex]._id;
                await axios.put(`${BASE_URL}/api/Admission/${id}`, formData);
                setEditIndex(null);
            } else {
                // CREATE: POST /api/AdmissionFees
                await axios.post(`${BASE_URL}/api/AdmissionFees`, formData);
                sendWhatsAppMessage(formData);
            }
            fetchAdmissions(); // Refresh list from DB
            setFormData({ studentName: '', fatherName: '', dob: '', whatsapp: '', className: '', feeAmount: '', discount: '', securityDeposit: '', annualFund: '' });
        } catch (err) {
            console.error(err);
            alert("Error communicating with the server.");
        }
    };

    const handleDelete = async (row) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                // DELETE: /api/Admission/:id
                await axios.delete(`${BASE_URL}/api/Admission/${row._id}`);
                fetchAdmissions();
            } catch (err) {
                alert("Error deleting record.");
            }
        }
    };

    const groupedRecords = records.reduce((acc, record) => {
        const normalizedClass = record.className.trim().toLowerCase();
        if (!acc[normalizedClass]) acc[normalizedClass] = [];
        acc[normalizedClass].push(record);
        return acc;
    }, {});

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
                <Typography variant="h4" fontWeight="800" color="#1e293b">Admissions</Typography>
                <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={downloadOverallPDF} disabled={records.length === 0} sx={{ borderRadius: '12px', px: 3, py: 1, textTransform: 'none', bgcolor: '#1e293b' }}>
                    Export All
                </Button>
            </Box>

            {/* Dashboard Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <AccountBalanceWalletIcon sx={{ fontSize: 48, color: '#3b82f6', mb: 1 }} />
                            <Typography color="textSecondary" variant="overline" fontWeight="700">Total Collection</Typography>
                            <Typography variant="h3" fontWeight="800" sx={{ color: '#0f172a' }}>RS {stats.total.toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: { xs: 250, md: 300 } }}>
                        <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2 }}>Revenue by Class</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <ChartTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                                    {stats.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Form */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', mb: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Student Information</Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} required /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="date" label="DOB" name="dob" value={formData.dob} onChange={handleChange} InputLabelProps={{ shrink: true }} required /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="WhatsApp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required placeholder="92..." /></Grid>
                        <Grid item xs={6} sm={4} md={2}><TextField fullWidth label="Class" name="className" value={formData.className} onChange={handleChange} required /></Grid>
                        <Grid item xs={6} sm={4} md={2}><TextField fullWidth type="number" label="Fee" name="feeAmount" value={formData.feeAmount} onChange={handleChange} required /></Grid>
                        <Grid item xs={6} sm={4} md={2}><TextField fullWidth type="number" label="Discount" name="discount" value={formData.discount} onChange={handleChange} /></Grid>
                        <Grid item xs={6} sm={6} md={3}><TextField fullWidth type="number" label="Security" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6} md={3}><TextField fullWidth type="number" label="Annual Fund" name="annualFund" value={formData.annualFund} onChange={handleChange} /></Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" size="large" fullWidth sx={{ py: 1.8, borderRadius: '12px', fontWeight: '700', textTransform: 'none', fontSize: '1rem', bgcolor: '#3b82f6' }}>
                                {editIndex !== null ? "Update Record" : "Confirm & Send WhatsApp"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* List */}
            {Object.keys(groupedRecords).sort().map((classKey) => (
                <Accordion key={classKey} sx={{ mb: 1.5, borderRadius: '12px !important', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
                    <AccordionSummary expandMoreIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight="700" sx={{ flexGrow: 1, textTransform: 'capitalize' }}>{classKey}</Typography>
                        <Typography variant="body2" color="textSecondary">{groupedRecords[classKey].length} Students</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '700', bgcolor: '#f8fafc' }}>Student</TableCell>
                                        <TableCell sx={{ fontWeight: '700', bgcolor: '#f8fafc' }}>Payment Breakdown</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: '700', bgcolor: '#f8fafc' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groupedRecords[classKey].map((row, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="600">{row.studentName}</Typography>
                                                <Typography variant="caption" color="textSecondary">{row.fatherName}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: '700', color: '#10b981' }}>
                                                    Net: RS {Number(row.feeAmount) - Number(row.discount || 0) + Number(row.annualFund || 0)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <IconButton size="small" onClick={() => downloadIndividualPDF(row)} color="secondary">
                                                        <PictureAsPdfIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => { setFormData(row); setEditIndex(records.indexOf(row)); }} color="primary">
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(row)} color="error">
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default AdmissionFees;