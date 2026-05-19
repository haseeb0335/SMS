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

    /* Adjusted minWidth settings to give the columns a tight, responsive budget on mobile views */
    const studentColumns = [
        { id: "rollNum", label: "Roll Num", minWidth: { xs: 60, md: 100 } },
        { id: "name", label: "Name", minWidth: { xs: 100, md: 170 } },
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
                /* Dynamic padding makes the button compact on mobile to save critical horizontal screen space */
                px: { xs: 1.5, md: 3 },
                py: { xs: 0.8, md: 1 },
                fontSize: { xs: '0.75rem', md: '0.875rem' },
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
        <Container maxWidth="xl" sx={{ mt: { xs: 1.5, sm: 3, md: 6 }, mb: { xs: 1.5, sm: 3, md: 6 }, px: { xs: 1, sm: 2 } }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <CircularProgress thickness={4} size={50} />
                </Box>
            ) : (
                <Paper 
                    elevation={0}
                    sx={{ 
                        width: "100%", 
                        p: { xs: 1.5, sm: 3, md: 5 }, 
                        borderRadius: { xs: "20px", sm: "32px" }, 
                        border: '1px solid #f0f0f0',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)'
                    }}
                >
                    <Stack 
                        direction={{ xs: 'column', md: 'row' }} 
                        spacing={{ xs: 2, sm: 3 }} 
                        justifyContent="space-between" 
                        alignItems={{ xs: 'stretch', md: 'center' }} 
                        mb={{ xs: 3, sm: 4, md: 6 }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar 
                                sx={{ 
                                    bgcolor: 'primary.main', 
                                    width: { xs: 46, md: 60 }, 
                                    height: { xs: 46, md: 60 }, 
                                    borderRadius: '14px',
                                    boxShadow: '0 8px 16px -4px rgba(25, 118, 210, 0.5)'
                                }}
                            >
                                <PeopleAltIcon sx={{ fontSize: { xs: "1.4rem", sm: "2rem" } }} />
                            </Avatar>
                            <Box>
                                <Typography 
                                    variant="h3" 
                                    fontWeight="900" 
                                    sx={{ 
                                        color: '#0f172a', 
                                        letterSpacing: '-0.5px',
                                        fontSize: { xs: '1.45rem', md: '2.25rem' } 
                                    }}
                                >
                                    Class Students
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    fontWeight="500" 
                                    display="block"
                                    sx={{ fontSize: { xs: '0.8rem', md: '0.95rem' } }}
                                >
                                    Browse and manage your student directory
                                </Typography>
                            </Box>
                        </Stack>

                        <TextField
                            placeholder="Quick search..."
                            variant="outlined"
                            size="small" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ 
                                width: { xs: '100%', md: '350px' },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
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
                                        <SearchIcon color="primary" fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>

                    {rows.length > 0 ? (
                        /* Adjusted widths and cells text padding configs to force full viewport lock on small screens */
                        <Box sx={{ 
                            width: '100%',
                            maxWidth: '100%',
                            overflowX: 'hidden', // Stops screen bleeding/horizontal scrolling completely
                            '& .MuiTableCell-root': {
                                px: { xs: 1, sm: 2 }, // Reduces side margins of columns inside the table data cells on mobile
                            },
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
                        <Box sx={{ textAlign: 'center', py: { xs: 6, md: 12 }, bgcolor: '#f8fafc', borderRadius: '24px', px: 2 }}>
                            <Typography color="text.secondary" variant="body2" fontWeight="600">
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