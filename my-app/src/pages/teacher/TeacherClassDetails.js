import { useEffect, useState, useRef, Fragment } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";

import {
    Paper,
    Typography,
    Button,
    Box,
    Container,
    Stack,
    Menu,
    MenuItem,
    CircularProgress,
    Divider,
    Chip
} from '@mui/material';

import TableTemplate from "../../components/TableTemplate";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SchoolIcon from '@mui/icons-material/School';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

const TeacherClassDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { sclassStudents, loading, error } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    const classID = currentUser?.teachSclass?._id;
    const subjectID = currentUser?.teachSubject?._id;
    const className = currentUser?.teachSclass?.sclassName;
    const subjectName = currentUser?.teachSubject?.subName;

    useEffect(() => {
        if (classID) {
            dispatch(getClassStudents(classID));
        }
    }, [dispatch, classID]);

    const studentColumns = [
        { id: 'name', label: 'Student Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll No.', minWidth: 100 },
    ];

    const studentRows = sclassStudents?.map((student) => ({
        name: student.name,
        rollNum: student.rollNum,
        id: student._id,
    })) || [];

    const StudentsButtonHaver = ({ row }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);

        const handleOpen = (event) => setAnchorEl(event.currentTarget);
        const handleClose = () => setAnchorEl(null);

        const handleAction = (type) => {
            handleClose();
            if (type === 'attendance') {
                navigate(`/Teacher/student/attendance/${row.id}/${subjectID}`);
            } else if (type === 'marks') {
                navigate(`/Teacher/class/student/marks/${row.id}/${subjectID}`);
            } else {
                navigate("/Teacher/student/" + row.id);
            }
        };

        return (
            <Fragment>
                <Button
                    variant="contained"
                    disableElevation
                    onClick={handleOpen}
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                    Actions
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                        sx: { borderRadius: '12px', minWidth: 180, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }
                    }}
                >
                    <MenuItem onClick={() => handleAction('view')}>View Profile</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleAction('attendance')}>Take Attendance</MenuItem>
                    <MenuItem onClick={() => handleAction('marks')}>Provide Marks</MenuItem>
                </Menu>
            </Fragment>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {!classID ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '20px' }}>
                    <Typography color="error" variant="h6">No class assigned by Admin</Typography>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    {/* Header Card */}
                    <Paper 
                        elevation={0} 
                        variant="outlined" 
                        sx={{ 
                            p: 3, 
                            borderRadius: '24px', 
                            bgcolor: 'primary.main', 
                            color: 'white' 
                        }}
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <SchoolIcon />
                                    <Typography variant="h4" fontWeight="800">
                                        {className}
                                    </Typography>
                                </Stack>
                                <Typography variant="h6" sx={{ opacity: 0.8 }}>
                                    Subject: {subjectName}
                                </Typography>
                            </Box>
                            <Chip 
                                label={`${sclassStudents?.length || 0} Students`} 
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} 
                            />
                        </Stack>
                    </Paper>

                    {/* Table Section */}
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: { xs: 2, md: 3 }, 
                            borderRadius: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                            <PersonSearchIcon color="primary" />
                            <Typography variant="h5" fontWeight="700">Student Directory</Typography>
                        </Stack>

                        {Array.isArray(sclassStudents) && sclassStudents.length > 0 ? (
                            <TableTemplate
                                buttonHaver={StudentsButtonHaver}
                                columns={studentColumns}
                                rows={studentRows}
                            />
                        ) : (
                            <Typography align="center" sx={{ py: 10 }} color="text.secondary">
                                No students found in this class.
                            </Typography>
                        )}
                    </Paper>
                </Stack>
            )}
        </Container>
    );
};

export default TeacherClassDetails;