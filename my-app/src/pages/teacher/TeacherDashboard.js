import { useState, useEffect } from "react";
import {
  CssBaseline,
  Box,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { Navigate, Route, Routes } from "react-router-dom";

import { AppBar, Drawer } from "../../components/styles";
import AccountMenu from "../../components/AccountMenu";
import TeacherSideBar from "./TeacherSideBar";
import TeacherSelfAttendance from "./TeacherSelfAttendance";

import Logout from "../Logout";

import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../../redux/userRelated/userHandle";

/* Pages */
import TeacherQuizPage from "./TeacherQuizPage";
import TeacherHomePage from "./TeacherHomePage";
import TeacherProfile from "./TeacherProfile";
import TeacherStudentsPage from "./TeacherStudentsPage";
import TeacherClassDetails from "./TeacherClassDetails";
import TeacherComplain from "./TeacherComplain";
import TeacherViewStudent from "./TeacherViewStudent";
import TeacherAttendancePage from "./TeacherAttendancePage";
import TeacherSalaryPage from "./TeacherSalaryPage";

import ViewStudent from "../admin/studentRelated/ViewStudent";
import StudentAttendance from "../admin/studentRelated/StudentAttendance";
import StudentExamMarks from "../admin/studentRelated/StudentExamMarks";

/* ✅ Import Test component */
import Test from "./Test";

const TeacherDashboard = () => {

  const [open, setOpen] = useState(true);

  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  /* Refresh user data when dashboard loads */

  useEffect(() => {

    if (currentUser?._id) {
      dispatch(getUserDetails(currentUser._id, "Teachers"));
    }

  }, [dispatch, currentUser?._id]);

  return (
    <Box sx={{ display: "flex" }}>

      <CssBaseline />

      {/* NAVBAR */}

      <AppBar open={open} position="absolute">

        <Toolbar sx={{ pr: "24px" }}>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "36px",
              ...(open && { display: "none" })
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Teacher Dashboard
          </Typography>

           <AccountMenu profilePic={currentUser?.profilePic} />

        </Toolbar>

      </AppBar>

      {/* SIDEBAR */}

      <Drawer
        variant="permanent"
        open={open}
        sx={open ? styles.drawerStyled : styles.hideDrawer}
      >

        <Toolbar sx={styles.toolBarStyled}>

          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>

        </Toolbar>

        <Divider />

        <List component="nav">
          <TeacherSideBar />
        </List>

      </Drawer>

      {/* MAIN CONTENT */}

      <Box component="main" sx={styles.boxStyled}>

        <Toolbar />

        <Routes>

          <Route path="/" element={<TeacherHomePage />} />
          <Route path="/Teacher/dashboard" element={<TeacherHomePage />} />

          <Route path="/Teacher/profile" element={<TeacherProfile />} />

          <Route path="/Teacher/students" element={<TeacherStudentsPage />} />
          <Route path="/Teacher/student/:id" element={<ViewStudent />} />
          <Route path="/Teacher/class/student/:id" element={<TeacherViewStudent />} />

          <Route path="/Teacher/classes" element={<TeacherClassDetails />} />
            <Route path="/Teacher/self-attendance" element={<TeacherSelfAttendance />} />
          <Route
            path="/Teacher/attendance"
            element={<TeacherAttendancePage />}
          />

          <Route
            path="/Teacher/student/attendance/:studentID/:subjectID"
            element={<StudentAttendance situation="Subject" />}
          />
            <Route path="/Teacher/test" element={<Test />} />
          <Route
            path="/Teacher/class/student/marks/:studentID/:subjectID"
            element={<StudentExamMarks situation="Subject" />}
          />

          <Route
            path="/Teacher/salary"
            element={<TeacherSalaryPage />}
          />

          <Route path="/Teacher/complain" element={<TeacherComplain />} />
          <Route path="/teacher-quiz" element={<TeacherQuizPage />} />

          <Route path="/logout" element={<Logout />} />

          <Route path="*" element={<Navigate to="/Teacher/dashboard" />} />

        </Routes>

      </Box>

    </Box>
  );
};

export default TeacherDashboard;

const styles = {

  boxStyled: {
    backgroundColor: (theme) =>
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : theme.palette.grey[900],
    flexGrow: 1,
    height: "100vh",
    overflow: "auto"
  },

  toolBarStyled: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    px: [1]
  },

  drawerStyled: {
    display: "flex"
  },

  hideDrawer: {
    display: "flex",
    "@media (max-width:600px)": {
      display: "none"
    }
  }

};