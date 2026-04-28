import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    postDone,
    doneSuccess
} from './teacherSlice';

// const BASE_URL = "http://localhost:5000";
// const BASE_URL = "https://sms-xi-rose.vercel.app";
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5001";

export const getTeachersByClass = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/TeachersClass/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};

export const getAllTeachers = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/Teachers/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
}

// Fixed updateTeacher to accept 'address' and use the correct endpoint
export const updateTeacher = (fields, id, address) => async (dispatch) => {
    try {
        // Changed URL from /Teachers/ to /Teacher/ to match your getTeacherDetails pattern
        // Added the address parameter to the body so the backend knows what to do
        const res = await axios.put(`${BASE_URL}/Teacher/${id}`, { ...fields, address }, {
            headers: { "Content-Type": "application/json" },
        });
        dispatch(doneSuccess(res.data)); 
    } catch (err) {
        console.log(err);
    }
};

export const getTeacherDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/Teacher/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
}

export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
    dispatch(getRequest());

    try {
        await axios.put(`${BASE_URL}/TeacherSubject`, { teacherId, teachSubject }, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error.message));
    }
}
// Add this to teacherHandle.js
export const removeTeacherAttendance = (teacherId, recordId) => async (dispatch) => {
    dispatch(getRequest()); // Start loading
    try {
        // Using the exact endpoint from your TeacherSelfAttendance code
        await axios.put(`${BASE_URL}/RemoveTeacherAtten/${teacherId}`, { recordId });
        
        // Refresh the details so the UI updates
        const result = await axios.get(`${BASE_URL}/Teacher/${teacherId}`);
        dispatch(doneSuccess(result.data));
    } catch (error) {
        dispatch(getError(error.message));
    }
};

// import axios from 'axios';
// import {
//     getRequest,
//     getSuccess,
//     getFailed,
//     getError,
//     postDone,
//     doneSuccess
// } from './teacherSlice';

// // const BASE_URL = "http://localhost:5000";
// const BASE_URL = "https://sms-xi-rose.vercel.app";
// export const getTeachersByClass = (id) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         const result = await axios.get(`${BASE_URL}/TeachersClass/${id}`);
//         if (result.data.message) {
//             dispatch(getFailed(result.data.message));
//         } else {
//             dispatch(getSuccess(result.data));
//         }
//     } catch (error) {
//         dispatch(getError(error.message));
//     }
// };

// export const getAllTeachers = (id) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         const result = await axios.get(`${BASE_URL}/Teachers/${id}`);
//         if (result.data.message) {
//             dispatch(getFailed(result.data.message));
//         } else {
//             dispatch(getSuccess(result.data));
//         }
//     } catch (error) {
//         dispatch(getError(error.message));
//     }
// }
// // teacherHandle.js

// export const updateTeacher = (fields, id) => async (dispatch) => {
//   try {
//     const res = await axios.put(`${BASE_URL}/Teachers/${id}`, fields, {
//       headers: { "Content-Type": "application/json" },
//     });
//     dispatch(doneSuccess(res.data)); // update Redux currentUser
//   } catch (err) {
//     console.log(err);
//   }
// };

// export const getTeacherDetails = (id) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         const result = await axios.get(`${BASE_URL}/Teacher/${id}`);
//         if (result.data) {
//             dispatch(doneSuccess(result.data));
//         }
//     } catch (error) {
//         dispatch(getError(error.message));
//     }
// }

// export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
//     dispatch(getRequest());

//     try {
//         await axios.put(`${BASE_URL}/TeacherSubject`, { teacherId, teachSubject }, {
//             headers: { 'Content-Type': 'application/json' },
//         });
//         dispatch(postDone());
//     } catch (error) {
//         dispatch(getError(error.message));
//     }
// }