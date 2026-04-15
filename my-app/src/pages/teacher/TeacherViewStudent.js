import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../../redux/userRelated/userHandle";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Collapse,
  Table,
  TableBody,
  TableHead,
  Typography,
  Paper,
} from "@mui/material";

import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

import {
  calculateOverallAttendancePercentage,
  calculateSubjectAttendancePercentage,
  groupAttendanceBySubject,
} from "../../components/attendanceCalculator";

import CustomPieChart from "../../components/CustomPieChart";
import { PurpleButton } from "../../components/buttonStyles";
import { StyledTableCell, StyledTableRow } from "../../components/styles";

const TeacherViewStudent = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();

  const { currentUser, userDetails, loading, error } = useSelector(
    (state) => state.user
  );

  const studentID = params.id;
  const address = "Student";

  const teachSubject = currentUser?.teachSubject?.subName;
  const teachSubjectID = currentUser?.teachSubject?._id;

  useEffect(() => {
    dispatch(getUserDetails(studentID, address));
  }, [dispatch, studentID]);

  const [sclassName, setSclassName] = useState("");
  const [studentSchool, setStudentSchool] = useState("");
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [subjectAttendance, setSubjectAttendance] = useState([]);

  const [openStates, setOpenStates] = useState({});

  const handleOpen = (subId) => {
    setOpenStates((prev) => ({
      ...prev,
      [subId]: !prev[subId],
    }));
  };

  useEffect(() => {
    if (userDetails) {
      setSclassName(userDetails.sclassName || "");
      setStudentSchool(userDetails.school || "");
      setSubjectMarks(userDetails.examResult || []);
      setSubjectAttendance(userDetails.attendance || []);
    }
  }, [userDetails]);

  const overallAttendancePercentage =
    calculateOverallAttendancePercentage(subjectAttendance);

  const chartData = [
    { name: "Present", value: overallAttendancePercentage },
    { name: "Absent", value: 100 - overallAttendancePercentage },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading student</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>

        {/* STUDENT BASIC INFO */}

        <Typography variant="h4" gutterBottom>
          Student Details
        </Typography>

        <Typography><b>Name:</b> {userDetails?.name}</Typography>
        <Typography><b>Roll Number:</b> {userDetails?.rollNum}</Typography>
        <Typography><b>Class:</b> {sclassName?.sclassName}</Typography>
        <Typography><b>School:</b> {studentSchool?.schoolName}</Typography>

        <br />

        {/* ATTENDANCE SECTION */}

        <Typography variant="h5" gutterBottom>
          Attendance
        </Typography>

        {subjectAttendance.length > 0 &&
          Object.entries(groupAttendanceBySubject(subjectAttendance)).map(
            ([subName, { present, allData, subId, sessions }]) => {
              if (subName !== teachSubject) return null;

              const percent = calculateSubjectAttendancePercentage(
                present,
                sessions
              );

              return (
                <Table key={subId} sx={{ mb: 3 }}>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell>Subject</StyledTableCell>
                      <StyledTableCell>Present</StyledTableCell>
                      <StyledTableCell>Total Sessions</StyledTableCell>
                      <StyledTableCell>Percentage</StyledTableCell>
                      <StyledTableCell align="center">
                        Details
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableHead>

                  <TableBody>
                    <StyledTableRow>
                      <StyledTableCell>{subName}</StyledTableCell>
                      <StyledTableCell>{present}</StyledTableCell>
                      <StyledTableCell>{sessions}</StyledTableCell>
                      <StyledTableCell>{percent}%</StyledTableCell>

                      <StyledTableCell align="center">
                        <Button
                          variant="contained"
                          onClick={() => handleOpen(subId)}
                        >
                          {openStates[subId]
                            ? <KeyboardArrowUp />
                            : <KeyboardArrowDown />}
                        </Button>
                      </StyledTableCell>
                    </StyledTableRow>

                    <StyledTableRow>
                      <StyledTableCell colSpan={5} sx={{ p: 0 }}>
                        <Collapse in={openStates[subId]}>
                          <Box sx={{ m: 2 }}>
                            <Typography variant="h6">
                              Attendance Details
                            </Typography>

                            <Table size="small">
                              <TableHead>
                                <StyledTableRow>
                                  <StyledTableCell>Date</StyledTableCell>
                                  <StyledTableCell align="right">
                                    Status
                                  </StyledTableCell>
                                </StyledTableRow>
                              </TableHead>

                              <TableBody>
                                {allData.map((data, index) => {
                                  const date = new Date(data.date)
                                    .toISOString()
                                    .substring(0, 10);

                                  return (
                                    <StyledTableRow key={index}>
                                      <StyledTableCell>
                                        {date}
                                      </StyledTableCell>

                                      <StyledTableCell align="right">
                                        {data.status}
                                      </StyledTableCell>
                                    </StyledTableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              );
            }
          )}

        <Typography sx={{ mt: 2 }}>
          Overall Attendance: {overallAttendancePercentage.toFixed(2)}%
        </Typography>

        <CustomPieChart data={chartData} />

        <br />

        {/* ADD ATTENDANCE BUTTON */}

        <Button
          variant="contained"
          onClick={() =>
            navigate(
              `/Teacher/subject/student/attendance/${studentID}/${teachSubjectID}`
            )
          }
        >
          Add Attendance
        </Button>

        <br /><br />

        {/* MARKS SECTION */}

        <Typography variant="h5" gutterBottom>
          Subject Marks
        </Typography>

        {subjectMarks.map((result, index) => {
          if (result.subName?.subName !== teachSubject) return null;

          return (
            <Table key={index} sx={{ mb: 2 }}>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Subject</StyledTableCell>
                  <StyledTableCell>Marks</StyledTableCell>
                </StyledTableRow>
              </TableHead>

              <TableBody>
                <StyledTableRow>
                  <StyledTableCell>
                    {result.subName.subName}
                  </StyledTableCell>

                  <StyledTableCell>
                    {result.marksObtained}
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          );
        })}

        <PurpleButton
          variant="contained"
          onClick={() =>
            navigate(
              `/Teacher/class/student/marks/${studentID}/${teachSubjectID}`
            )
          }
        >
          Add Marks
        </PurpleButton>

      </Paper>
    </Box>
  );
};

export default TeacherViewStudent;