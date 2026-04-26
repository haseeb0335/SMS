import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { 
    Container, Typography, TextField, Button, Stack, Alert, Grid, Box, 
    Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions 
} from "@mui/material";
import { 
    EventNote as LeaveIcon, 
    History as HistoryIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon 
} from "@mui/icons-material";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5000";

const ParentApplyLeave = () => {
    const { currentUser } = useSelector((state) => state.user);
    
    // Form States
    const [leaveDate, setLeaveDate] = useState("");
    const [leaveReason, setLeaveReason] = useState("");
    const [status, setStatus] = useState({ type: "", msg: "" });
    const [loader, setLoader] = useState(false);
    
    // History & Edit States
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLeaveId, setSelectedLeaveId] = useState(null);

    // 1. Fetch History from Parent Collection
    const fetchParentLeaveHistory = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/Parent/${currentUser._id}`);
            if (res.data && res.data.leaves) {
                // Sorting by most recent applied date
                const sorted = res.data.leaves.sort((a, b) => 
                    new Date(b.appliedAt) - new Date(a.appliedAt)
                );
                setLeaveHistory(sorted);
            }
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    useEffect(() => {
        if (currentUser?._id) fetchParentLeaveHistory();
    }, [currentUser?._id]);

    // 2. Handle Submit (New Leave)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);
        try {
            const payload = { 
                parentId: currentUser._id, 
                leaveDate, 
                leaveReason 
            };
            await axios.post(`${BASE_URL}/ApplyLeave`, payload);
            setStatus({ type: "success", msg: "Leave application submitted!" });
            setLeaveDate("");
            setLeaveReason("");
            fetchParentLeaveHistory();
        } catch (err) {
            setStatus({ type: "error", msg: "Submission failed. Try again." });
        }
        setLoader(false);
    };

    // 3. Handle Delete
    const handleDelete = async (leaveId) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await axios.delete(`${BASE_URL}/DeleteLeave/${currentUser._id}/${leaveId}`);
                fetchParentLeaveHistory();
            } catch (err) {
                alert("Could not delete. Server error.");
            }
        }
    };


    // 4. Handle Edit Logic
    const handleEditOpen = (leave) => {
        setSelectedLeaveId(leave._id);
        setLeaveDate(leave.leaveDate.split('T')[0]); // Format date for input
        setLeaveReason(leave.leaveReason);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        setLoader(true);
        try {
            await axios.put(`${BASE_URL}/UpdateLeave/${currentUser._id}/${selectedLeaveId}`, {
                leaveDate,
                leaveReason
            });
            setIsEditModalOpen(false);
            setLeaveDate("");
            setLeaveReason("");
            fetchParentLeaveHistory();
            setStatus({ type: "success", msg: "Application updated successfully!" });
        } catch (err) {
            alert("Update failed.");
        }
        setLoader(false);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                    Leave Management
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Apply for child leave and manage existing requests.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Application Form */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ p: 4, borderRadius: 4, border: '1px solid #eee' }} elevation={0}>
                        <Typography variant="h6" fontWeight="700" mb={3}>New Application</Typography>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                {status.msg && <Alert severity={status.type} sx={{ borderRadius: 2 }}>{status.msg}</Alert>}
                                <TextField
                                    label="Leave Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={leaveDate}
                                    onChange={(e) => setLeaveDate(e.target.value)}
                                    required
                                />
                                <TextField
                                    label="Reason"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={leaveReason}
                                    onChange={(e) => setLeaveReason(e.target.value)}
                                    required
                                />
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    disabled={loader}
                                    startIcon={<LeaveIcon />}
                                    sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                                >
                                    {loader ? "Processing..." : "Submit Application"}
                                </Button>
                            </Stack>
                        </form>
                    </Card>
                </Grid>

                {/* History Table */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ borderRadius: 4, border: '1px solid #eee' }} elevation={0}>
                        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon color="action" />
                            <Typography variant="h6" fontWeight="700">Application History</Typography>
                        </Box>
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Reason</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8f9fa' }} align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {leaveHistory.length > 0 ? (
                                        leaveHistory.map((leave) => (
                                            <TableRow key={leave._id} hover>
                                                <TableCell>{new Date(leave.leaveDate).toLocaleDateString()}</TableCell>
                                                <TableCell>{leave.leaveReason}</TableCell>
                                                <TableCell>
                                                    <Chip label={leave.status} size="small" color="warning" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => handleEditOpen(leave)} size="small" color="primary">
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDelete(leave._id)} size="small" color="error">
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                No records found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>
            </Grid>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Update Leave Request</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Leave Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={leaveDate}
                            onChange={(e) => setLeaveDate(e.target.value)}
                        />
                        <TextField
                            label="Reason"
                            multiline
                            rows={4}
                            fullWidth
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} variant="contained" disabled={loader}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ParentApplyLeave;