import React from 'react'
// CHANGE: Import HashRouter instead of BrowserRouter
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import ChooseUser from './pages/ChooseUser';
import ParentDashboard from './pages/parent/ParentDashboard';
import Logout from './pages/Logout';

const App = () => {
  const { currentRole } = useSelector(state => state.user);

  return (
    // This will now work with the file:// protocol

    
    <Router>
      {currentRole === null &&
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/choose" element={<ChooseUser visitor="normal" />} />
          <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />

          <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
          <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
          <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />
          <Route path="/Parentlogin" element={<LoginPage role="Parent" />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/Parent/dashboard" element={<ParentDashboard />} />

          <Route path="/Adminregister" element={<AdminRegisterPage />} />
          
          <Route path='*' element={<Navigate to="/" />} />
        </Routes>}

      {currentRole === "Admin" &&
        <>
          <AdminDashboard />
        </>
      }

      {currentRole === "Student" &&
        <>
          <StudentDashboard />
        </>
      }

      {currentRole === "Teacher" &&
        <>
          <TeacherDashboard />
        </>
      }

      {currentRole === "Parent" &&
        <Routes>
          {/* Note: HashRouter handles the /* wildcards better for nested electron routes */}
          <Route path="/Parent/dashboard/*" element={<ParentDashboard />} />
          <Route path='*' element={<Navigate to="/Parent/dashboard" />} />
        </Routes>
      }
    </Router>
  )
}

export default App