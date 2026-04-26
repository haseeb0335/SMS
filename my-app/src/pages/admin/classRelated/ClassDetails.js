import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassDetails, getClassStudents, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import {
    Box, Container, Typography, Tab, IconButton, Paper, Divider, Stack
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { BlueButton, GreenButton, PurpleButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { getAllTeachers, getTeachersByClass } from "../../../redux/teacherRelated/teacherHandle";
import styled from "styled-components";

const ClassDetails = () => {
    const params = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, sclassStudents, sclassDetails, loading, error, response, getresponse } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);

    const classID = params.id

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"))
        dispatch(getClassStudents(classID));
        dispatch(getAllTeachers(classID));
        dispatch(getTeachersByClass(classID));
    }, [dispatch, classID])

    const [value, setValue] = useState('1');
    const handleChange = (event, newValue) => { setValue(newValue); };

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // const BASE_URL = "http://localhost:5000";
    // const BASE_URL = "https://sms-xi-rose.vercel.app";
    const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5000";

    const deleteHandler = async (deleteID, address) => {
        try {
            await axios.delete(`${BASE_URL}/${address}/${deleteID}`);
            setMessage("Deleted Successfully ✅");
            setShowPopup(true);
            dispatch(getClassDetails(classID, "Sclass"));
            dispatch(getSubjectList(classID, "ClassSubjects"));
            dispatch(getClassStudents(classID));
            dispatch(getTeachersByClass(classID));
        } catch (error) {
            setMessage("Delete Failed ❌");
            setShowPopup(true);
        }
    };

    // Sub-Sections Layouts
    const ClassSubjectsSection = () => (
        <ContentWrapper>
            <SectionHeader>
                <Typography variant="h6">Subjects List</Typography>
                {!response && <SpeedDialTemplate actions={subjectActions} />}
            </SectionHeader>
            {response ? (
                <EmptyState>
                    <Typography color="textSecondary">No subjects assigned to this class.</Typography>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/Admin/addsubject/" + classID)}>
                        Add Subjects
                    </GreenButton>
                </EmptyState>
            ) : (
                <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
            )}
        </ContentWrapper>
    );

    const ClassStudentsSection = () => (
        <ContentWrapper>
            <SectionHeader>
                <Typography variant="h6">Students List</Typography>
                {!getresponse && <SpeedDialTemplate actions={studentActions} />}
            </SectionHeader>
            {getresponse ? (
                <EmptyState>
                    <Typography color="textSecondary">No students enrolled yet.</Typography>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/Admin/class/addstudents/" + classID)}>
                        Add Students
                    </GreenButton>
                </EmptyState>
            ) : (
                <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
            )}
        </ContentWrapper>
    );

    const ClassTeachersSection = () => (
        <ContentWrapper>
            <SectionHeader>
                <Typography variant="h6">Assigned Teachers</Typography>
                <SpeedDialTemplate actions={teacherActions} />
            </SectionHeader>
            {teacherRows.length > 0 ? (
                <TableTemplate columns={teacherColumns} rows={teacherRows} buttonHaver={TeachersButtonHaver} />
            ) : (
                <EmptyState>
                    <Typography color="textSecondary">No teachers assigned to this class.</Typography>
                </EmptyState>
            )}
        </ContentWrapper>
    );

    const ClassDetailsSection = () => {
        const numberOfSubjects = Array.isArray(subjectsList) ? subjectsList.length : 0;
        const numberOfStudents = Array.isArray(sclassStudents) ? sclassStudents.length : 0;
        const numberOfTeachers = Array.isArray(teachersList) ? teachersList.length : 0;

        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h5" sx={{ mb: 1, color: '#1e293b' }}>
                    Welcome to Class {sclassDetails?.sclassName || "..."}
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
                    Manage and view all information related to this section.
                </Typography>

                <GridContainer>
                    <StatBox>
                        <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase' }}>Students</Typography>
                        <Typography variant="h4">{numberOfStudents}</Typography>
                    </StatBox>
                    <StatBox>
                        <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase' }}>Subjects</Typography>
                        <Typography variant="h4">{numberOfSubjects}</Typography>
                    </StatBox>
                    <StatBox>
                        <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase' }}>Teachers</Typography>
                        <Typography variant="h4">{numberOfTeachers}</Typography>
                    </StatBox>
                </GridContainer>
            </Box>
        );
    };

    // Columns & Row Mappings
    const subjectColumns = [{ id: 'name', label: 'Subject', minWidth: 170 }, { id: 'code', label: 'Code', minWidth: 100 }];
    const subjectRows = Array.isArray(subjectsList) ? subjectsList.map((s) => ({ name: s.subName, code: s.subCode, id: s._id })) : [];
    
    const studentColumns = [{ id: 'name', label: 'Student Name', minWidth: 170 }, { id: 'rollNum', label: 'Roll No', minWidth: 100 }];
    const studentRows = Array.isArray(sclassStudents) ? sclassStudents.map((s) => ({ name: s.name, rollNum: s.rollNum, id: s._id })) : [];

    const teacherColumns = [{ id: 'name', label: 'Teacher', minWidth: 170 }, { id: 'subject', label: 'Subject', minWidth: 100 }];
    const teacherRows = Array.isArray(teachersList) ? teachersList.map((t) => ({ name: t.name, subject: t.teachSubject?.subName || "N/A", id: t._id })) : [];

    // Button Havers
    const SubjectsButtonHaver = ({ row }) => (
        <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton onClick={() => deleteHandler(row.id, "Subject")} size="small"><DeleteIcon color="error" fontSize="small" /></IconButton>
            <BlueButton size="small" variant="contained" onClick={() => navigate(`/Admin/class/subject/${classID}/${row.id}`)}>View</BlueButton>
        </Stack>
    );

    const StudentsButtonHaver = ({ row }) => (
        <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton onClick={() => deleteHandler(row.id, "Student")} size="small"><PersonRemoveIcon color="error" fontSize="small" /></IconButton>
            <BlueButton size="small" variant="contained" onClick={() => navigate("/Admin/students/student/" + row.id)}>View</BlueButton>
            <PurpleButton size="small" variant="contained" onClick={() => navigate("/Admin/students/student/attendance/" + row.id)}>Attendance</PurpleButton>
        </Stack>
    );

    const TeachersButtonHaver = ({ row }) => (
        <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton onClick={() => deleteHandler(row.id, "Teacher")} size="small"><PersonRemoveIcon color="error" fontSize="small" /></IconButton>
            <BlueButton size="small" variant="contained" onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}>View</BlueButton>
        </Stack>
    );

    // Actions
    const subjectActions = [
        { icon: <PostAddIcon color="primary" />, name: 'Add Subject', action: () => navigate("/Admin/addsubject/" + classID) },
        { icon: <DeleteIcon color="error" />, name: 'Delete All', action: () => deleteHandler(classID, "SubjectsClass") }
    ];

    const studentActions = [
        { icon: <PersonAddAlt1Icon color="primary" />, name: 'Add Student', action: () => navigate("/Admin/class/addstudents/" + classID) },
        { icon: <PersonRemoveIcon color="error" />, name: 'Delete All', action: () => deleteHandler(classID, "StudentsClass") },
    ];

    const teacherActions = [
        { icon: <PersonAddAlt1Icon color="primary" />, name: 'Add Teacher', action: () => navigate("/Admin/teachers/chooseclass") },
        { icon: <PersonRemoveIcon color="error" />, name: 'Delete All', action: () => deleteHandler(classID, "TeachersClass") },
    ];

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>Loading...</Box>
            ) : (
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', bgcolor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
                        <Container maxWidth="lg">
                            <TabList 
                                onChange={handleChange} 
                                variant="scrollable" 
                                scrollButtons="auto"
                                sx={{ 
                                    '& .MuiTabs-indicator': { backgroundColor: '#6366f1' },
                                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 400, color: '#64748b' },
                                    '& .Mui-selected': { color: '#6366f1 !important' }
                                }}
                            >
                                <Tab label="Overview" value="1" />
                                <Tab label="Subjects" value="2" />
                                <Tab label="Students" value="3" />
                                <Tab label="Teachers" value="4" />
                            </TabList>
                        </Container>
                    </Box>

                    <Container maxWidth="lg" sx={{ py: 4 }}>
                        <TabPanel value="1" sx={{ p: 0 }}><ClassDetailsSection /></TabPanel>
                        <TabPanel value="2" sx={{ p: 0 }}><ClassSubjectsSection /></TabPanel>
                        <TabPanel value="3" sx={{ p: 0 }}><ClassStudentsSection /></TabPanel>
                        <TabPanel value="4" sx={{ p: 0 }}><ClassTeachersSection /></TabPanel>
                    </Container>
                </TabContext>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ClassDetails;

/* --- MODERN STYLES --- */

const ContentWrapper = styled(Paper)`
  border-radius: 16px !important;
  border: 1px solid #eef2f6 !important;
  padding: 24px;
  background: white !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
  
  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const SectionHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  color: #1e293b;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const StatBox = styled(Paper)`
  padding: 24px;
  border-radius: 16px !important;
  border: 1px solid #eef2f6 !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white !important;
`;

const EmptyState = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  text-align: center;
`;