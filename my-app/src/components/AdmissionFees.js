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
import axios from 'axios'; // Ensure axios is installed: npm install axios

const AdmissionFees = () => {
    const [formData, setFormData] = useState({
        studentName: '', fatherName: '', dob: '', whatsapp: '',
        className: '', feeAmount: '', discount: '', 
        securityDeposit: '', annualFund: ''
    });
    
    const [records, setRecords] = useState([]);
    const [editIndex, setEditIndex] = useState(null);

    // FETCH DATA FROM BACKEND ON LOAD
    useEffect(() => {
        const fetchAdmissions = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admissions');
                setRecords(res.data);
            } catch (err) {
                console.error("Error fetching admissions:", err);
            }
        };
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
                // UPDATE RECORD IN DB
                const id = records[editIndex]._id;
                const res = await axios.put(`http://localhost:5000/api/admissions/${id}`, formData);
                const updated = [...records];
                updated[editIndex] = res.data;
                setRecords(updated);
                setEditIndex(null);
            } else {
                // SAVE NEW RECORD TO DB
                const res = await axios.post('http://localhost:5000/api/admissions', formData);
                setRecords([...records, res.data]);
                sendWhatsAppMessage(formData);
            }
            setFormData({ studentName: '', fatherName: '', dob: '', whatsapp: '', className: '', feeAmount: '', discount: '', securityDeposit: '', annualFund: '' });
        } catch (err) {
            alert("Error saving data to database.");
        }
    };

    const handleDelete = async (row) => {
        if (window.confirm("Delete this record permanently?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admissions/${row._id}`);
                setRecords(records.filter(r => r._id !== row._id));
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
            {/* ... Rest of your UI remains exactly the same ... */}
            {/* Note: In the Action buttons, ensure you call handleDelete(row) */}
            
            {/* Example Update for the delete button in the map: */}
            {/* <IconButton size="small" onClick={() => handleDelete(row)} color="error"> */}
            {/* <DeleteIcon fontSize="small" /> */}
            {/* </IconButton> */}
        </Box>
    );
};

export default AdmissionFees;