import React, { useState, useMemo, useEffect } from 'react';
import { 
    Box, Typography, Paper, Grid, TextField, Button, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Accordion, AccordionSummary, AccordionDetails, Card, CardContent,
    useTheme, useMediaQuery, Stack
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const BASE_URL = "https://sms-xi-rose.vercel.app";

const AdmissionFees = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [formData, setFormData] = useState({
        studentName: '', fatherName: '', dob: '', whatsapp: '',
        className: '', feeAmount: '', discount: '', 
        securityDeposit: '', annualFund: ''
    });
    
    const [records, setRecords] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

    const fetchAdmissions = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/Admissions`);
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
        doc.text("Allied School system", 105, 20, { align: 'center' }); 
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("Admission Receipt", 105, 30, { align: 'center' }); 

        autoTable(doc, {
            startY: 40,
            body: [
                ['Student Name', student.studentName], 
                ['Father Name', student.fatherName], 
                ['Class', student.className], 
                ['------------------', '------------------'],
                ['Admission Fee', `RS ${student.feeAmount}`],
                ['Annual Fund', `RS ${student.annualFund || 0}`],
                ['Discount', `- RS ${student.discount || 0}`],
                ['------------------', '------------------'],
                ['Total Net Paid', `RS ${Number(student.feeAmount) - Number(student.discount || 0) + Number(student.annualFund || 0)}`] 
            ],
            theme: 'striped',
            styles: { fontSize: 11 },
            columnStyles: {
                0: { fontStyle: 'bold', width: 50 },
            },
            headStyles: { fillColor: [30, 41, 59] }
        });

        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setDrawColor(220, 38, 38); 
        doc.setLineWidth(1.5);
        doc.rect(140, finalY, 40, 15); 
        
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("PAID", 160, finalY + 10, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
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
                const id = records[editIndex]._id;
                await axios.put(`${BASE_URL}/Admission/${id}`, formData);
                setEditIndex(null);
            } else {
                await axios.post(`${BASE_URL}/AdmissionFees`, formData);
                sendWhatsAppMessage(formData);
            }
            fetchAdmissions();
            setFormData({ studentName: '', fatherName: '', dob: '', whatsapp: '', className: '', feeAmount: '', discount: '', securityDeposit: '', annualFund: '' });
        } catch (err) {
            console.error(err);
            alert("Error communicating with the server.");
        }
    };

    const handleDelete = async (row) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await axios.delete(`${BASE_URL}/Admission/${row._id}`);
                fetchAdmissions();
            } catch (err) {
                alert("Error deleting record.");
            }
        }
    };

    const groupedRecords = records.reduce((acc, record) => {
        const normalizedClass = record.className.trim().toLowerCase().replace(/\s+/g, ' ');
        if (!acc[normalizedClass]) acc[normalizedClass] = [];
        acc[normalizedClass].push(record);
        return acc;
    }, {});

    return (
        <Box sx={{ p: { xs: 1.5, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header Content */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
                <Typography variant="h4" fontWeight="900" color="#1e293b" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Admissions</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<FileDownloadIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />} 
                    onClick={downloadOverallPDF} 
                    disabled={records.length === 0} 
                    sx={{ borderRadius: '12px', px: 3, py: 1.2, textTransform: 'none', bgcolor: '#1e293b', width: { xs: '100%', sm: 'auto' } }}
                >
                    Export All
                </Button>
            </Box>

            {/* Dashboard Cards Side-by-Side Analytics Container */}
            <Stack 
                direction="row" 
                spacing={{ xs: 1.5, md: 3 }} 
                sx={{ mb: 4, width: '100%', alignItems: 'stretch' }}
            >
                {/* Total Collection Box */}
                <Card sx={{ flex: 1, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, md: 3 }, '&:last-child': { pb: { xs: 1.5, md: 3 } } }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: { xs: 26, md: 40 }, color: '#3b82f6', mb: 0.5 }} />
                        <Typography color="textSecondary" variant="overline" fontWeight="800" sx={{ display: 'block', fontSize: { xs: '0.6rem', md: '0.75rem' }, lineHeight: 1.2, letterSpacing: 0.5 }}>Total Paid</Typography>
                        <Typography variant="h6" fontWeight="900" sx={{ color: '#0f172a', mt: 0.5, fontSize: { xs: '0.85rem', sm: '1.3rem', md: '1.65rem' }, whiteSpace: 'nowrap' }}>
                            RS {stats.total.toLocaleString()}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Micro-Sized Premium Graph Analytics Box */}
                <Paper sx={{ flex: { xs: 1.8, md: 2 }, p: { xs: 1.5, md: 2.5 }, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'none', height: { xs: 130, sm: 180, md: 220 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: { xs: '0.6rem', md: '0.75rem' } }}>Revenue by Class</Typography>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: isMobile ? 8 : 10, fontWeight: 600}} />
                            <YAxis axisLine={false} tickLine={false} hide />
                            <ChartTooltip cursor={{fill: 'rgba(59, 130, 246, 0.04)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', fontSize: '11px' }} />
                            <Bar dataKey="total" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={isMobile ? 12 : 16} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Stack>

            {/* Application Data Form */}
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '20px', border: '1px solid #e2e8f0', mb: 4, boxShadow: 'none' }}>
                <Typography variant="h6" fontWeight="800" color="#1e293b" sx={{ mb: 3 }}>Student Information</Typography>
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
                            <Button type="submit" variant="contained" size="large" fullWidth sx={{ py: 1.8, borderRadius: '12px', fontWeight: '800', textTransform: 'none', fontSize: '0.95rem', bgcolor: '#3b82f6', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
                                {editIndex !== null ? "Update Record" : "Confirm & Send WhatsApp"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Custom Responsive Nested Group Lists */}
            {Object.keys(groupedRecords).sort().map((classKey) => (
                <Accordion key={classKey} sx={{ mb: 2, borderRadius: '16px !important', border: '1px solid #e2e8f0', boxShadow: 'none', '&::before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}>
                        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ width: '100%', pr: 1 }}>
                            <Typography fontWeight="800" sx={{ textTransform: 'capitalize', color: '#0f172a' }}>{classKey}</Typography>
                            <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: '8px' }}>{groupedRecords[classKey].length} Students</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, borderTop: '1px solid #f1f5f9' }}>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: '700', bgcolor: '#f8fafc', py: 1.5 }}>Student</TableCell>
                                        <TableCell sx={{ fontWeight: '700', bgcolor: '#f8fafc', py: 1.5 }}>Payment Breakdown</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: '700', bgcolor: '#f8fafc', py: 1.5, whiteSpace: 'nowrap' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groupedRecords[classKey].map((row, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell sx={{ py: 1.5, minWidth: '140px' }}>
                                                <Typography variant="body2" fontWeight="700" color="#0f172a">{row.studentName}</Typography>
                                                <Typography variant="caption" fontWeight="500" color="textSecondary">{row.fatherName}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5, minWidth: '220px' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '600', display: 'block', mb: 0.2 }}>
                                                    Fee: RS {row.feeAmount} | Disc: RS {row.discount || 0} | Annual: RS {row.annualFund || 0}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: '800', color: '#10b981' }}>
                                                    Net Paid: RS {Number(row.feeAmount) - Number(row.discount || 0) + Number(row.annualFund || 0)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1.5 }}>
                                                <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ flexWrap: 'nowrap' }}>
                                                    <IconButton size="small" onClick={() => downloadIndividualPDF(row)} color="secondary" sx={{ p: { xs: 1, sm: 1.2 } }}>
                                                        <PictureAsPdfIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => { setFormData(row); setEditIndex(records.indexOf(row)); }} color="primary" sx={{ p: { xs: 1, sm: 1.2 } }}>
                                                        <EditIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(row)} color="error" sx={{ p: { xs: 1, sm: 1.2 } }}>
                                                        <DeleteIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                                                    </IconButton>
                                                </Stack>
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