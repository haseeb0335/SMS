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
  Cancel as CancelIcon 
} from '@mui/icons-material';
import axios from 'axios';

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

  // Replace with your actual admin ID from Redux/LocalStorage
  const adminID = "YOUR_ADMIN_ID"; 

  // 1. Fetch Expenses from Backend
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/ExpenseList/${adminID}`);
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

  // 2. Add or Update Expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update Logic (Note: You might need to add a PUT route in your backend)
        await axios.put(`http://localhost:5000/ExpenseUpdate/${currentId}`, formData);
        setIsEditing(false);
        setCurrentId(null);
      } else {
        // Add Logic
        await axios.post('http://localhost:5000/ExpenseCreate', { ...formData, adminID });
      }
      setFormData({ date: '', category: '', description: '', amount: '' });
      fetchExpenses(); // Refresh list
    } catch (err) {
      alert("Failed to save expense");
    }
  };

  // 3. Delete Expense
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:5000/ExpenseDelete/${id}`);
        fetchExpenses();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  // 4. Set form for Editing
  const handleEditClick = (expense) => {
    setIsEditing(true);
    setCurrentId(expense._id); // MongoDB uses _id
    setFormData({
      date: expense.date.split('T')[0], // Format date for input
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
    });
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1e293b' }}>
        School Expense Management
      </Typography>

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
                  <IconButton color="primary" onClick={() => handleEditClick(expense)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(expense._id)}><DeleteIcon fontSize="small" /></IconButton>
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