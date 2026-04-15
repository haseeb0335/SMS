import axios from 'axios';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getRequest,
    getError,
    updateCurrentUser,

    // ✅ ADD THESE (IMPORTANT)
    STUDENT_PROFILE_REQUEST,
    STUDENT_PROFILE_SUCCESS,
    STUDENT_PROFILE_FAIL

} from './userSlice';

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "sms-nine-beige.vercel.app";

// LOGIN
export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await axios.post(`${BASE_URL}/${role}Login`, fields);

        if (result.data.role) {
            dispatch(authSuccess(result.data));
        } else {
            dispatch(authFailed(result.data.message));
        }

    } catch (error) {
        dispatch(authError(error.message));
    }
};


// REGISTER
export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${BASE_URL}/${role}Reg`, fields);

        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else if (result.data.school) {
            dispatch(stuffAdded(result.data));
        }
        else {
            dispatch(authFailed(result.data.message));
        }

    } catch (error) {
        dispatch(authError(error.message));
    }
};


// LOGOUT
export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};


// GET USER
export const getUserDetails = (id, address) => async (dispatch) => {

    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/${address}/${id}`);
        dispatch(doneSuccess(result.data));
    } catch (error) {
        dispatch(getError(error.message));
    }
};


// DELETE USER
export const deleteUser = (id, address) => async (dispatch) => {

    dispatch(getRequest());

    try {
        const result = await axios.delete(`${BASE_URL}/${address}/${id}`);
        dispatch(doneSuccess(result.data));
    } catch (error) {
        dispatch(getError(error.message));
    }
};


// UPDATE USER
export const updateUser = (fields, id, address) => async (dispatch) => {

  try {
    const result = await axios.put(
      `${BASE_URL}/${address}/${id}`,
      fields,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    dispatch(updateCurrentUser(result.data));

  } catch (error) {
    console.log(error);
  }
};


// ADD STAFF
export const addStuff = (fields, address) => async (dispatch) => {

    dispatch(authRequest());

    try {
        const result = await axios.post(`${BASE_URL}/${address}Create`, fields);

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }

    } catch (error) {
        dispatch(authError(error.message));
    }
};


// ✅ FIXED STUDENT PROFILE (IMPORTANT)
export const getStudentProfile = (id) => async (dispatch) => {
    try {
        dispatch(STUDENT_PROFILE_REQUEST());

        const res = await axios.get(`${BASE_URL}/StudentProfile/${id}`);

        console.log("API RESPONSE:", res.data);

        dispatch(STUDENT_PROFILE_SUCCESS(res.data));

    } catch (error) {
        console.log("API ERROR:", error);

        dispatch(STUDENT_PROFILE_FAIL(error.message));
    }
};