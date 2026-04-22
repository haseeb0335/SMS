import React, { useState } from 'react';
import { Fab, Drawer, Box, Typography, TextField, IconButton, Paper, CircularProgress } from '@mui/material';
import { SmartToy as RobotIcon, Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const FloatingAI = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const { currentUser } = useSelector(state => state.user);

    const handleAsk = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            // Fetch fresh expense context before asking
            const contextRes = await axios.get(`https://sms-xi-rose.vercel.app/ExpenseList/${currentUser._id}`);
            
            const res = await axios.post(`https://sms-xi-rose.vercel.app/AskAI`, {
                question: query,
                contextData: {
                    adminName: currentUser.name,
                    expenses: contextRes.data
                }
            });
            setResponse(res.data.answer);
        } catch (err) {
            setResponse("I'm sorry, I couldn't process that. Check your API key.");
        }
        setLoading(false);
    };

    return (
        <>
            {/* The Floating Button */}
            <Fab 
                color="primary" 
                aria-label="ai-assistant"
                onClick={() => setOpen(true)}
                sx={{ position: 'fixed', bottom: 20, right: 20, bgcolor: '#1e293b', '&:hover': { bgcolor: '#334155' } }}
            >
                <RobotIcon />
            </Fab>

            {/* The Sidebar Chat Drawer */}
            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <Box sx={{ width: 350, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">AI Assistant</Typography>
                        <IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="e.g. Total expense this month?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    <IconButton 
                        onClick={handleAsk} 
                        disabled={loading}
                        sx={{ mt: 1, alignSelf: 'flex-end', bgcolor: '#1976d2', color: 'white' }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                    </IconButton>

                    {response && (
                        <Paper elevation={0} sx={{ mt: 3, p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                {response}
                            </Typography>
                        </Paper>
                    )}
                </Box>
            </Drawer>
        </>
    );
};

export default FloatingAI;