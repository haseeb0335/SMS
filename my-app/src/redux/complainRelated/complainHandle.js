import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './complainSlice';


// const BASE_URL = "http://localhost:5000";
// const BASE_URL = "https://sms-xi-rose.vercel.app";
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sms-xi-rose.vercel.app"
    : "http://localhost:5000";
export const getAllComplains = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/ComplainList/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};
export const deleteComplain = async (id) => {

    try {

        await axios.delete(`http://localhost:5000/ComplainDelete/${id}`);

    } catch (error) {

        console.log(error);

    }

};