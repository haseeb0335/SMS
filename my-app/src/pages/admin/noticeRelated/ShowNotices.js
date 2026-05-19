import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import {
    Paper, Box, IconButton, Typography, CircularProgress, Container, Stack, useMediaQuery, useTheme
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import CampaignIcon from '@mui/icons-material/Campaign';
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';

const ShowNotices = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.error("Notice Board Error Root:", error);
    }

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllNotices(currentUser._id, "Notice"));
            });
    };

    const noticeColumns = [
        { id: 'title', label: 'Announcement Title', minWidth: 170 },
        { id: 'details', label: 'Description Details', minWidth: 200 },
        { id: 'date', label: 'Publish Date', minWidth: 120 },
    ];

    const noticeRows = noticesList && noticesList.length > 0 && noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "N/A";
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            id: notice._id,
        };
    });

    const NoticeButtonHaver = ({ row }) => {
        return (
            <IconButton onClick={() => deleteHandler(row.id, "Notice")} size="small" sx={{ color: theme.palette.error.main }}>
                <DeleteIcon fontSize="small" />
            </IconButton>
        );
    };

    const actions = [
        {
            icon: <NoteAddIcon color="primary" />, 
            name: 'Create Announcement',
            action: () => navigate("/Admin/addnotice")
        },
        {
            icon: <DeleteIcon color="error" />, 
            name: 'Flush All Notices',
            action: () => deleteHandler(currentUser._id, "Notices")
        }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress strokeWidth={3} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 1.5, md: 4 }, mb: 4, px: { xs: 1.5, sm: 3 } }}>
            <Box>
                {/* Standardized Branding Header Block Grid row element */}
                <Stack 
                    direction={isMobile ? "column" : "row"} 
                    justifyContent="space-between" 
                    alignItems={isMobile ? "stretch" : "center"} 
                    spacing={2} 
                    sx={{ mb: 4 }}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ bgcolor: '#3b82f6', p: 1, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CampaignIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                        </Box>
                        <Typography variant="h4" fontWeight="900" color="#1e293b" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                            Notice Board
                        </Typography>
                    </Stack>
                    
                    {/* Render standard primary action when server stack responds array empty indicator context */}
                    {response && (
                        <GreenButton 
                            variant="contained"
                            onClick={() => navigate("/Admin/addnotice")}
                            sx={{ borderRadius: '12px', px: 4, py: 1, fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
                        >
                            Add New Notice
                        </GreenButton>
                    )}
                </Stack>

                {!response && (
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            width: '100%', 
                            overflow: 'hidden', 
                            borderRadius: '24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: 'none',
                            position: 'relative'
                        }}
                    >
                        {Array.isArray(noticesList) && noticesList.length > 0 ? (
                            <TableTemplate 
                                buttonHaver={NoticeButtonHaver} 
                                columns={noticeColumns} 
                                rows={noticeRows} 
                            />
                        ) : (
                            <Box sx={{ p: 8, textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight="700" color="#64748b" mb={1}>
                                    No Active Announcements Available
                                </Typography>
                                <Typography variant="body2" color="#94a3b8">
                                    Current system deployment broadcast arrays contain zero notice entities.
                                </Typography>
                            </Box>
                        )}
                        <SpeedDialTemplate actions={actions} />
                    </Paper>
                )}
            </Box>
        </Container>
    );
};

export default ShowNotices;