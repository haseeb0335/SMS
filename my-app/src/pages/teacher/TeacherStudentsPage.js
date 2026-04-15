import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { useNavigate } from "react-router-dom";
import { 
    Paper, 
    Box, 
    Typography, 
    TextField, 
    CircularProgress, 
    Container, 
    InputAdornment, 
    Stack,
    Avatar
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TableTemplate from "../../components/TableTemplate";
import { BlueButton } from "../../components/buttonStyles";

const TeacherStudentsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentUser } = useSelector((state) => state.user);
    const { sclassStudents, loading } = useSelector((state) => state.sclass);

    const [search, setSearch] = useState("");
    const classID = currentUser?.teachSclass?._id;

    useEffect(() => {
        if (classID) {
            dispatch(getClassStudents(classID));
        }
    }, [dispatch, classID]);

    const studentColumns = [
        { id: "rollNum", label: "Roll Number", minWidth: 100 },
        { id: "name", label: "Name", minWidth: 170 },
    ];

    const rows = sclassStudents && sclassStudents.length > 0 
        ? sclassStudents
            .filter((student) => {
                const studentName = student.name?.toLowerCase() || "";
                const roll = student.rollNum?.toString() || "";
                return studentName.includes(search.toLowerCase()) || roll.includes(search);
            })
            .map((student) => ({
                name: student.name,
                rollNum: student.rollNum !== undefined ? student.rollNum : "N/A",
                id: student._id,
            }))
        : [];

    const StudentsButton = ({ row }) => (
        <BlueButton 
            variant="contained" 
            sx={{ 
                borderRadius: '12px', 
                textTransform: 'none',
                px: 3,
                fontWeight: 600,
                boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
                }
            }} 
            onClick={() => navigate(`/Teacher/student/${row.id}`)}
        >
            View Profile
        </BlueButton>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <CircularProgress thickness={4} size={50} />
                </Box>
            ) : (
                <Paper 
                    elevation={0}
                    sx={{ 
                        width: "100%", 
                        p: { xs: 3, md: 5 }, 
                        borderRadius: "32px",
                        border: '1px solid #f0f0f0',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)'
                    }}
                >
                    <Stack 
                        direction={{ xs: 'column', md: 'row' }} 
                        spacing={3} 
                        justifyContent="space-between" 
                        alignItems={{ xs: 'flex-start', md: 'center' }} 
                        mb={6}
                    >
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Avatar 
                                sx={{ 
                                    bgcolor: 'primary.main', 
                                    width: 60, 
                                    height: 60, 
                                    borderRadius: '18px',
                                    boxShadow: '0 8px 16px -4px rgba(25, 118, 210, 0.5)'
                                }}
                            >
                                <PeopleAltIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="h3" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-1px' }}>
                                    Class Students
                                </Typography>
                                <Typography variant="body1" color="text.secondary" fontWeight="500">
                                    Browse and manage your student directory
                                </Typography>
                            </Box>
                        </Stack>

                        <TextField
                            placeholder="Quick search..."
                            variant="outlined"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ 
                                width: { xs: '100%', md: '350px' },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px',
                                    backgroundColor: '#ffffff',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#f8fafc',
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)'
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>

                    {rows.length > 0 ? (
                        <Box sx={{ 
                            '& .MuiTableCell-head': { 
                                bgcolor: '#f8fafc', 
                                color: '#64748b', 
                                fontWeight: 700,
                                py: 2
                            } 
                        }}>
                            <TableTemplate buttonHaver={StudentsButton} columns={studentColumns} rows={rows} />
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#f8fafc', borderRadius: '24px' }}>
                            <Typography color="text.secondary" variant="h6" fontWeight="600">
                                {search ? "We couldn't find a match for that search." : "Your class list is currently empty."}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            )}
        </Container>
    );
};

export default TeacherStudentsPage;