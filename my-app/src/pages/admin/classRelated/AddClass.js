import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { BlueButton } from "../../../components/buttonStyles";
import Popup from "../../../components/Popup";
import Classroom from "../../../assets/classroom.png";
import styled from "styled-components";

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error, tempDetails } = userState;

    const adminID = currentUser._id
    const address = "Sclass"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = {
        sclassName,
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added' && tempDetails) {
            navigate("/Admin/classes/class/" + tempDetails._id)
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch, tempDetails]);

    return (
        <>
            <StyledContainer>
                <StyledBox elevation={0}>
                    <Stack sx={{ alignItems: 'center', mb: 4 }}>
                        <ImageWrapper>
                            <img
                                src={Classroom}
                                alt="classroom"
                                style={{ width: '120px', height: 'auto' }}
                            />
                        </ImageWrapper>
                        <Typography variant="h5" sx={{ mt: 2, color: '#1e293b', fontWeight: 500 }}>
                            Add New Class
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                            Create a new section for your school management
                        </Typography>
                    </Stack>
                    
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <TextField
                                label="Class Name (e.g. Grade 10)"
                                variant="outlined"
                                fullWidth
                                value={sclassName}
                                onChange={(event) => setSclassName(event.target.value)}
                                required
                                InputProps={{
                                    sx: { borderRadius: '10px' }
                                }}
                            />
                            
                            <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
                                <BlueButton
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    type="submit"
                                    disabled={loader}
                                    sx={{ 
                                        borderRadius: '10px', 
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {loader ? <CircularProgress size={24} color="inherit" /> : "Create Class"}
                                </BlueButton>
                                
                                <Button 
                                    variant="text" 
                                    onClick={() => navigate(-1)}
                                    sx={{ color: '#64748b', textTransform: 'none' }}
                                >
                                    Go Back
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </StyledBox>
            </StyledContainer>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddClass

const StyledContainer = styled(Box)`
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  justify-content: center;
  background-color: #f8fafc;
  min-height: 80vh;
  padding: 20px;
`;

const StyledBox = styled(Box)`
  width: 100%;
  max-width: 450px;
  padding: 40px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);

  @media (max-width: 600px) {
    padding: 24px;
  }
`;

const ImageWrapper = styled.div`
  background-color: #f1f5f9;
  padding: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
`;