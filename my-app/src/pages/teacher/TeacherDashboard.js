import { useState, useEffect } from "react";
import {
  CssBaseline,
  Box,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer as MuiDrawer // Import native unstyled drawer for mobile modal overlay
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppBar, Drawer as CustomDesktopDrawer } from "../../components/styles";
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

/* Test Component */
import Test from "./Test";

const TeacherDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Mobile drawer starts closed (false), Desktop starts open (true)
  const [open, setOpen] = useState(!isMobile);

  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const teacherId = currentUser?._id;

  const toggleDrawer = () => {
    setOpen(!open);
  };

  /* Refresh user details data */
  useEffect(() => {
    if (teacherId) {
      dispatch(getUserDetails(teacherId, "Teachers"));
    }
  }, [dispatch, teacherId]);

  // Sync state cleanly whenever window resizing or changing viewpoints
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* NAVBAR */}
      <AppBar open={isMobile ? false : open} position="absolute">
        <Toolbar sx={{ pr: "24px" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: "20px",
              ...(!isMobile && open && { display: "none" }) 
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

      {/* 📱 MOBILE SIDEBAR DRAWER (Uses native MuiDrawer for 100% overlay compatibility) */}
      {isMobile ? (
        <MuiDrawer
          variant="temporary"
          open={open}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={styles.mobileDrawerFix}
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
        </MuiDrawer>
      ) : (
        /* 💻 DESKTOP SIDEBAR DRAWER (Uses your original custom styled drawer wrapper unchanged) */
        <CustomDesktopDrawer
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
        </CustomDesktopDrawer>
      )}

      {/* MAIN CONTENT CANVAS AREA */}
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
          <Route path="/Teacher/attendance" element={<TeacherAttendancePage />} />
          <Route path="/Teacher/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
          <Route path="/Teacher/test" element={<Test />} />
          <Route path="/Teacher/class/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />
          <Route path="/Teacher/salary" element={<TeacherSalaryPage />} />
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

/* --- COMPONENT STYLING PROPERTIES --- */
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

  mobileDrawerFix: {
    display: "flex",
    '& .MuiDrawer-paper': { 
      width: '240px', 
      boxSizing: 'border-box'
    }
  },

  hideDrawer: {
    display: "flex",
    "@media (max-width:600px)": {
      display: "none"
    }
  }
};