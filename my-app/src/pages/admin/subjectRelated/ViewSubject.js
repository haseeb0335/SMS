import React, { useEffect, useState } from 'react';
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Tab, Container, Typography, BottomNavigation, 
  BottomNavigationAction, Paper, Card, CardContent, 
  Grid, Divider, CircularProgress, Stack, useTheme, useMediaQuery 
} from '@mui/material';
import { BlueButton, GreenButton, PurpleButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';

const ViewSubject = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { subloading, subjectDetails, sclassStudents, getresponse, error } = useSelector((state) => state.sclass);
  const { classID, subjectID } = params;

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  const [value, setValue] = useState('1');
  const [selectedSection, setSelectedSection] = useState('attendance');

  const handleChange = (event, newValue) => setValue(newValue);
  const handleSectionChange = (event, newSection) => setSelectedSection(newSection);

  const studentColumns = [
    { id: 'rollNum', label: 'Roll No.', minWidth: 80 },
    { id: 'name', label: 'Name', minWidth: 150 },
  ];

  const studentRows = sclassStudents.map((student) => ({
    rollNum: student.rollNum,
    name: student.name,
    id: student._id,
  }));

  const StudentsAttendanceButtonHaver = ({ row }) => (
    <Stack direction={isMobile ? "column" : "row"} spacing={1}>
      <BlueButton variant="contained" size="small" onClick={() => navigate("/Admin/students/student/" + row.id)}>
        View
      </BlueButton>
      <PurpleButton
        variant="contained"
        size="small"
        onClick={() => navigate(`/Admin/subject/student/attendance/${row.id}/${subjectID}`)}
      >
        Attendance
      </PurpleButton>
    </Stack>
  );

  const StudentsMarksButtonHaver = ({ row }) => (
    <Stack direction={isMobile ? "column" : "row"} spacing={1}>
      <BlueButton variant="contained" size="small" onClick={() => navigate("/Admin/students/student/" + row.id)}>
        View
      </BlueButton>
      <PurpleButton
        variant="contained"
        size="small"
        onClick={() => navigate(`/Admin/subject/student/marks/${row.id}/${subjectID}`)}
      >
        Marks
      </PurpleButton>
    </Stack>
  );

  const SubjectStudentsSection = () => (
    <Box sx={{ pb: 10 }}>
      {getresponse ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <GreenButton variant="contained" onClick={() => navigate("/Admin/class/addstudents/" + classID)}>
            Add Students
          </GreenButton>
        </Box>
      ) : (
        <>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1e293b' }}>
            Students Enrolled
          </Typography>
          <TableTemplate 
            buttonHaver={selectedSection === 'attendance' ? StudentsAttendanceButtonHaver : StudentsMarksButtonHaver} 
            columns={studentColumns} 
            rows={studentRows} 
          />
          <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }} elevation={10}>
            <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
              <BottomNavigationAction
                label="Attendance"
                value="attendance"
                icon={selectedSection === 'attendance' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
              />
              <BottomNavigationAction
                label="Marks"
                value="marks"
                icon={selectedSection === 'marks' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
              />
            </BottomNavigation>
          </Paper>
        </>
      )}
    </Box>
  );

  const SubjectDetailsSection = () => {
    const infoItems = [
      { label: 'Subject Name', value: subjectDetails?.subName, icon: <AssignmentIcon color="primary" /> },
      { label: 'Subject Code', value: subjectDetails?.subCode, icon: <ClassIcon color="primary" /> },
      { label: 'Subject Sessions', value: subjectDetails?.sessions, icon: <InsertChartIcon color="primary" /> },
      { label: 'Total Students', value: sclassStudents.length, icon: <GroupsIcon color="primary" /> },
      { label: 'Class', value: subjectDetails?.sclassName?.sclassName, icon: <ClassIcon color="primary" /> },
    ];

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#0f172a' }}>
          Subject Overview
        </Typography>
        <Grid container spacing={3}>
          {infoItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={2} sx={{ borderRadius: 4, height: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {item.icon}
                  <Box>
                    <Typography variant="caption" color="textSecondary">{item.label}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{item.value || "N/A"}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 4, bgcolor: '#f8fafc' }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountCircleIcon fontSize="large" color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Subject Teacher</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {subjectDetails?.teacher ? subjectDetails.teacher.name : "No Teacher Assigned"}
                    </Typography>
                  </Box>
                </Box>
                {!subjectDetails?.teacher && (
                  <GreenButton variant="contained" onClick={() => navigate("/Admin/teachers/addteacher/" + subjectDetails?._id)}>
                    Assign Teacher
                  </GreenButton>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh' }}>
      {subloading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TabContext value={value}>
          <Paper elevation={0} sx={{ position: 'fixed', width: '100%', zIndex: 10, borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} centered={!isMobile} variant={isMobile ? "fullWidth" : "standard"}>
              <Tab label="Details" value="1" />
              <Tab label="Students" value="2" />
            </TabList>
          </Paper>
          <Container sx={{ pt: 10, pb: 4 }}>
            <TabPanel value="1" sx={{ p: 0 }}><SubjectDetailsSection /></TabPanel>
            <TabPanel value="2" sx={{ p: 0 }}><SubjectStudentsSection /></TabPanel>
          </Container>
        </TabContext>
      )}
    </Box>
  );
};

export default ViewSubject;