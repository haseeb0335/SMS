import React, { useState } from 'react';
import { 
    Box, Typography, TextField, Paper, IconButton, 
    CircularProgress, Avatar, Stack 
} from '@mui/material';
import { 
    Send as SendIcon, 
    SmartToy as RobotIcon, 
    Person as UserIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const BASE_URL = "https://sms-xi-rose.vercel.app";

const AiAssistant = () => {
    const { currentUser } = useSelector(state => state.user);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: `Hello ${currentUser.name}, I am your School AI. Ask me about expenses, student counts, or teacher performance.` }
    ]);

    // This function gathers current data to give the AI context
    const getSchoolContext = async () => {
        try {
            const expenseRes = await axios.get(`${BASE_URL}/ExpenseList/${currentUser._id}`);
            return {
                expenses: expenseRes.data || [],
                adminName: currentUser.name,
                schoolName: currentUser.schoolName || "the school"
            };
        } catch (err) {
            console.error("Context Fetch Error:", err);
            return { 
                expenses: [], 
                adminName: currentUser.name, 
                schoolName: "the school" 
            };
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        
        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            // 1. FETCH THE CONTEXT
            const context = await getSchoolContext();

            // 2. SEND TO BACKEND
            // Note: 'context' now contains the 'expenses' data inside it
            const res = await axios.post(`${BASE_URL}/AskAI`, {
                question: currentInput,
                contextData: context
            });

            // 3. UPDATE UI
            if (res.data && res.data.answer) {
                setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I couldn't generate an answer. Please try again." }]);
            }
        } catch (err) {
    console.error("FULL FRONTEND ERROR:", err.response?.data || err);
           
    setMessages(prev => [
        ...prev,
        { role: 'ai', text: err.response?.data?.error || "Server error" }
    ]);
} finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
                <RobotIcon color="primary" fontSize="large" /> School AI Insights
            </Typography>

            <Paper sx={{ flex: 1, p: 3, mb: 2, overflowY: 'auto', borderRadius: 3, bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.map((msg, index) => (
                    <Box key={index} sx={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <Stack direction={msg.role === 'user' ? 'row-reverse' : 'row'} spacing={1} alignItems="flex-start">
                            <Avatar sx={{ bgcolor: msg.role === 'user' ? '#1976d2' : '#1e293b' }}>
                                {msg.role === 'user' ? <UserIcon /> : <RobotIcon />}
                            </Avatar>
                            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: msg.role === 'user' ? '#1976d2' : 'white', color: msg.role === 'user' ? 'white' : 'black' }}>
                                <Typography variant="body1">{msg.text}</Typography>
                            </Paper>
                        </Stack>
                    </Box>
                ))}
                {loading && <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2 }} />}
            </Paper>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Ask me something..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                />
                <IconButton 
                    onClick={handleSend} 
                    disabled={loading}
                    sx={{ bgcolor: '#1e293b', color: 'white', p: 2, '&:hover': { bgcolor: '#334155' } }}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default AiAssistant;