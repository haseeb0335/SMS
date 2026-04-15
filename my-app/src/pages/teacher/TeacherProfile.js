import React, { useState } from "react";
import { KeyboardArrowDown, KeyboardArrowUp, PhotoCamera } from "@mui/icons-material";
import { Avatar, Button, Collapse, TextField, Paper, IconButton, Box, Typography, Container, Stack, Divider } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, updateUser } from "../../redux/userRelated/userHandle";
import { useNavigate } from "react-router-dom";
import { authLogout } from "../../redux/userRelated/userSlice";

const TeacherProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [showTab, setShowTab] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [schoolName, setSchoolName] = useState(currentUser?.schoolName || "");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(currentUser?.profilePic || "");

  const address = "Teacher";

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const updatedData = { name, email, schoolName, password, profilePic };
    dispatch(updateUser(updatedData, currentUser._id, address));
    alert("Profile Updated Successfully");
    setShowTab(false);
  };

  const deleteHandler = () => {
    if (window.confirm("Are you sure you want to delete your profile? This action is permanent.")) {
      dispatch(deleteUser(currentUser._id, "Students"));
      dispatch(deleteUser(currentUser._id, address));
      dispatch(authLogout());
      navigate("/");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          textAlign: "center", 
          borderRadius: 5, 
          boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
          border: "1px solid #f1f5f9"
        }}
      >
        {/* Profile Image Section */}
        <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
          <Avatar
            src={profilePic}
            sx={{ 
              width: 130, 
              height: 130, 
              border: "4px solid", 
              borderColor: "primary.light",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)" 
            }}
          />
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="upload-photo"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="upload-photo">
            <IconButton
              component="span"
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                background: "#fff",
                boxShadow: 2,
                "&:hover": { background: "#f8f9fa" }
              }}
              size="small"
            >
              <PhotoCamera fontSize="small" color="primary" />
            </IconButton>
          </label>
        </Box>

        {/* Info Header */}
        <Typography variant="h4" fontWeight="900" sx={{ mt: 1, letterSpacing: "-0.5px" }}>
          {name}
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight="500">
          {email}
        </Typography>
        <Typography variant="subtitle2" color="primary" sx={{ mt: 1, fontWeight: 700, textTransform: "uppercase", opacity: 0.8 }}>
          {schoolName}
        </Typography>

        <Divider sx={{ my: 4, opacity: 0.6 }} />

        {/* Action Buttons */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            sx={styles.showButton}
            onClick={() => setShowTab(!showTab)}
            startIcon={showTab ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            fullWidth={false}
          >
            {showTab ? "Cancel" : "Edit Profile"}
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={deleteHandler}
            sx={{ borderRadius: 3, px: 4, fontWeight: 700, textTransform: "none" }}
          >
            Delete Account
          </Button>
        </Stack>

        {/* Collapsible Edit Form */}
        <Collapse in={showTab} timeout="auto" unmountOnExit>
          <Box 
            component="form" 
            onSubmit={submitHandler} 
            sx={{ 
              mt: 4, 
              p: { xs: 2, md: 3 }, 
              bgcolor: "#fcfcfc", 
              borderRadius: 4, 
              border: "1px solid #eee" 
            }}
          >
            <Typography variant="h6" fontWeight="800" textAlign="left" mb={2}>
              Update Details
            </Typography>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                sx={styles.inputStyle}
              />
              <TextField
                fullWidth
                label="Associated School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                sx={styles.inputStyle}
              />
              <TextField
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={styles.inputStyle}
              />
              <TextField
                fullWidth
                label="New Password (optional)"
                type="password"
                value={password}
                placeholder="Leave blank to keep current"
                onChange={(e) => setPassword(e.target.value)}
                sx={styles.inputStyle}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ 
                  mt: 1, 
                  borderRadius: 3, 
                  fontWeight: 800, 
                  height: 50, 
                  textTransform: "none",
                  boxShadow: "0 10px 20px rgba(39, 8, 67, 0.2)"
                }}
              >
                Save Changes
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Paper>
    </Container>
  );
};

export default TeacherProfile;

const styles = {
  showButton: {
    backgroundColor: "#270843",
    borderRadius: 3,
    px: 4,
    fontWeight: 700,
    textTransform: "none",
    "&:hover": { backgroundColor: "#3f1068" }
  },
  inputStyle: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
    }
  }
};