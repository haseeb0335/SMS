import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, Button, Typography, Container, Grid, 
    Card, CardContent, CardActionArea, CircularProgress, 
    Stack, Divider, Paper 
} from '@mui/material';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate } from 'react-router-dom';
import ClassIcon from '@mui/icons-material/Class';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import styled from 'styled-components';

const ChooseClass = ({ situation }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    const navigateHandler = (classID) => {
        if (situation === "Teacher") {
            navigate("/Admin/teachers/choosesubject/" + classID);
        } else if (situation === "Subject") {
            navigate("/Admin/addsubject/" + classID);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={60} thickness={4} />
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                Select Class
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                Choose a class to proceed with {situation === "Teacher" ? "teacher assignment" : "subject addition"}.
                            </Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/Admin/addclass")}
                            sx={{ 
                                borderRadius: '10px', 
                                px: 3, 
                                py: 1, 
                                backgroundColor: '#6366f1',
                                '&:hover': { backgroundColor: '#4f46e5' }
                            }}
                        >
                            Add Class
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    {getresponse ? (
                        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '16px', bgcolor: '#f8fafc' }}>
                            <Typography variant="h6" color="textSecondary">
                                No classes found. Please add a class first.
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {Array.isArray(sclassesList) && sclassesList.map((sclass) => (
                                <Grid item xs={12} sm={6} md={4} key={sclass._id}>
                                    <StyledCard elevation={0}>
                                        <CardActionArea onClick={() => navigateHandler(sclass._id)} sx={{ h: '100%', p: 1 }}>
                                            <CardContent>
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <IconWrapper>
                                                        <ClassIcon sx={{ color: '#6366f1' }} />
                                                    </IconWrapper>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                            {sclass.sclassName}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                            Class ID: {sclass._id.substring(sclass._id.length - 5)}
                                                        </Typography>
                                                    </Box>
                                                    <ArrowForwardIosIcon sx={{ fontSize: 16, color: '#cbd5e1' }} />
                                                </Stack>
                                            </CardContent>
                                        </CardActionArea>
                                    </StyledCard>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}
        </Container>
    );
};

export default ChooseClass;

/* Modern UI Styled Components */

const StyledCard = styled(Card)`
    border-radius: 16px !important;
    border: 1px solid #e2e8f0 !important;
    transition: all 0.3s ease !important;
    background-color: #ffffff !important;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
        border-color: #6366f1 !important;
    }
`;

const IconWrapper = styled(Box)`
    background-color: #f1f5f9;
    padding: 12px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
`;