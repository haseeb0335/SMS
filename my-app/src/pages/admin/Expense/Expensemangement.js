import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, MenuItem,
  Grid, Card, CardContent, IconButton,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Print as PrintIcon, 
  Add as AddIcon, 
  Edit as EditIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon // New Icon
} from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable directly

 const BASE_URL = "https://sms-xi-rose.vercel.app";


const categories = ['Utilities', 'Salaries', 'Maintenance', 'Stationery', 'Events', 'Other'];

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    amount: '',
  });

  const { currentUser } = useSelector(state => state.user);
  const adminID = currentUser._id;

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/ExpenseList/${adminID}`);
      if (res.data && Array.isArray(res.data)) {
        setExpenses(res.data);
      }
    } catch (err) {
      console.error("Error fetching expenses", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // --- PDF GENERATION LOGIC ---

  // 1. Download ALL Expenses
  const downloadAllExpensesPDF = () => {
    const doc = new jsPDF();
    doc.text("School Expense Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    const tableColumn = ["Date", "Category", "Description", "Amount (Rs)"];
    const tableRows = [];

    expenses.forEach(expense => {
      const rowData = [
        new Date(expense.date).toLocaleDateString(),
        expense.category,
        expense.description,
        expense.amount.toLocaleString()
      ];
      tableRows.push(rowData);
    });

    // CHANGE: Use autoTable(doc, { ... }) instead of doc.autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillStyle: '#1e293b' } // Matches your dashboard theme
    });

    // To get the final Y position for the total:
    const finalY = doc.lastAutoTable.finalY; 
    doc.text(`Total Monthly Expense: Rs. ${totalExpense.toLocaleString()}`, 14, finalY + 10);
    
    doc.save("School_Expenses_Full_Report.pdf");
  };

  // 2. Download INDIVIDUAL Receipt
  const downloadIndividualExpensePDF = (expense) => {
    const doc = new jsPDF();
    doc.rect(10, 10, 190, 80); // Border
    doc.setFontSize(18);
    doc.text("EXPENSE VOUCHER", 70, 25);
    
    doc.setFontSize(12);
    doc.text(`Voucher ID: ${expense._id.substring(0, 8)}`, 20, 40);
    doc.text(`Date: ${new Date(expense.date).toLocaleDateString()}`, 20, 50);
    doc.text(`Category: ${expense.category}`, 20, 60);
    doc.text(`Description: ${expense.description}`, 20, 70);
    
    doc.setFontSize(14);
    doc.text(`TOTAL AMOUNT: Rs. ${expense.amount.toLocaleString()}`, 120, 70);
    
    doc.setFontSize(10);
    doc.text("Authorized Signature: __________________", 20, 85);
    
    doc.save(`Receipt_${expense.category}_${expense._id.substring(0, 5)}.pdf`);
  };

  // --- REMAINDER OF YOUR LOGIC ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${BASE_URL}/ExpenseUpdate/${currentId}`, formData);
        setIsEditing(false);
        setCurrentId(null);
      } else {
        await axios.post(`${BASE_URL}/ExpenseCreate`, { ...formData, adminID });
      }
      setFormData({ date: '', category: '', description: '', amount: '' });
      fetchExpenses();
    } catch (err) {
      alert("Failed to save expense");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`${BASE_URL}/ExpenseDelete/${id}`);
        fetchExpenses();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleEditClick = (expense) => {
    setIsEditing(true);
    setCurrentId(expense._id);
    setFormData({
      date: expense.date.split('T')[0],
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
    });
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
          School Expense Management
        </Typography>
        {/* DOWNLOAD ALL BUTTON */}
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<DownloadIcon />}
          onClick={downloadAllExpensesPDF}
        >
          Download Report (PDF)
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1e293b', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>TOTAL MONTHLY EXPENSE</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Rs. {totalExpense.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Form (Same as before) */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: isEditing ? '2px solid #1976d2' : 'none' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {isEditing ? "Update Expense Record" : "Add New Expense"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }}
                value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth select label="Category" value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                {categories.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Description" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth type="number" label="Amount" value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button fullWidth variant="contained" type="submit" sx={{ height: '56px', borderRadius: 2 }}>
                  {isEditing ? <EditIcon /> : <AddIcon />}
                </Button>
                {isEditing && (
                  <Button variant="outlined" color="error" onClick={() => { setIsEditing(false); setFormData({date:'', category:'', description:'', amount:''}); }}>
                    <CancelIcon />
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount (Rs)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id} hover>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#e2e8f0', borderRadius: 1, display: 'inline-block', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {expense.category.toUpperCase()}
                  </Box>
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{expense.amount.toLocaleString()}</TableCell>
                <TableCell align="right">
                  {/* INDIVIDUAL DOWNLOAD BUTTON */}
                  <IconButton color="success" onClick={() => downloadIndividualExpensePDF(expense)}>
                    <PrintIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleEditClick(expense)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(expense._id)}>
                    <DeleteIcon fontSize="small" />
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

export default ExpenseManagement;