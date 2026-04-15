import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress } from '@mui/material';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [className, setClassName] = useState('');
    const [sclassName, setSclassName] = useState('');

    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [email, setEmail] = useState('');

    const adminID = currentUser._id
    const role = "Student"
    const attendance = []

    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const changeHandler = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
        }
    }

    const fields = {
        name,
        fatherName,
        rollNum,
        password,
        sclassName,
        adminID,
        role,
        attendance,
        phone,
        dob,
        gender,
        address,
        emergencyContact,
        email
    };

    const submitHandler = (event) => {
        event.preventDefault()
        if (sclassName === "") {
            setMessage("Please select a classname")
            setShowPopup(true)
        }
        else {
            setLoader(true)
            dispatch(registerUser(fields, role))
        }
    }

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl())
            navigate(-1)
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
    }, [status, navigate, error, response, dispatch]);

    return (
        <>
            <div className="register">
                <form className="registerForm" onSubmit={submitHandler}>
                    <span className="registerTitle">Add Student</span>

                    <div className="formGrid">

                        <div className="formGroup">
                            <label>Student Name</label>
                            <input className="registerInput"
                                placeholder="Enter student name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required />
                        </div>

                        <div className="formGroup">
                            <label>Father Name</label>
                            <input className="registerInput"
                                placeholder="Enter father name"
                                value={fatherName}
                                onChange={(e) => setFatherName(e.target.value)}
                                required />
                        </div>

                        {situation === "Student" && (
                            <div className="formGroup fullWidth">
                                <label>Class</label>
                                <select className="registerInput"
                                    value={className}
                                    onChange={changeHandler}
                                    required>
                                    <option value='Select Class'>Select Class</option>
                                    {sclassesList.map((classItem, index) => (
                                        <option key={index} value={classItem.sclassName}>
                                            {classItem.sclassName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="formGroup">
                            <label>Roll Number</label>
                            <input className="registerInput" type="number"
                                placeholder="Enter roll number"
                                value={rollNum}
                                onChange={(e) => setRollNum(e.target.value)}
                                required />
                        </div>

                        <div className="formGroup">
                            <label>Email</label>
                            <input className="registerInput" type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="formGroup">
                            <label>Phone</label>
                            <input className="registerInput"
                                placeholder="Enter phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)} />
                        </div>

                        <div className="formGroup">
                            <label>Emergency Contact</label>
                            <input className="registerInput"
                                placeholder="Emergency contact"
                                value={emergencyContact}
                                onChange={(e) => setEmergencyContact(e.target.value)} />
                        </div>

                        <div className="formGroup">
                            <label>Date of Birth</label>
                            <input className="registerInput" type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)} />
                        </div>

                        <div className="formGroup">
                            <label>Gender</label>
                            <select className="registerInput"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}>
                                <option value="">Select</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="formGroup fullWidth">
                            <label>Home Address</label>
                            <textarea className="registerInput"
                                placeholder="Enter address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)} />
                        </div>

                        <div className="formGroup fullWidth">
                            <label>Password</label>
                            <input className="registerInput" type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                        </div>

                    </div>

                    <button className="registerButton" type="submit" disabled={loader}>
                        {loader ? <CircularProgress size={24} color="inherit" /> : 'Add Student'}
                    </button>
                </form>
            </div>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />

            {/* ✅ Responsive CSS */}
            <style>{`
                .register {
                    display: flex;
                    justify-content: center;
                    padding: 20px;
                }

                .registerForm {
                    width: 100%;
                    max-width: 950px;
                    background: #fff;
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
                }

                .registerTitle {
                    font-size: 26px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .formGrid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .formGroup {
                    display: flex;
                    flex-direction: column;
                }

                .fullWidth {
                    grid-column: span 2;
                }

                .registerInput {
                    padding: 11px;
                    border-radius: 8px;
                    border: 1px solid #ccc;
                    margin-top: 5px;
                    font-size: 14px;
                    transition: 0.2s;
                }

                .registerInput:focus {
                    outline: none;
                    border-color: #1976d2;
                    box-shadow: 0 0 0 2px rgba(25,118,210,0.1);
                }

                .registerButton {
                    margin-top: 25px;
                    width: 100%;
                    padding: 12px;
                    background: #1976d2;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .registerButton:hover {
                    background: #125ea8;
                }

                @media (max-width: 768px) {
                    .formGrid {
                        grid-template-columns: 1fr;
                    }

                    .fullWidth {
                        grid-column: span 1;
                    }

                    .registerForm {
                        padding: 15px;
                    }
                }
            `}</style>
        </>
    )
}

export default AddStudent;