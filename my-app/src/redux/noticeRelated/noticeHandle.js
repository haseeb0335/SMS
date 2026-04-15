import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './noticeSlice';

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "sms-nine-beige.vercel.app";

export const getAllNotices = (id, address) => async (dispatch) => {
    dispatch(getRequest());
if (!id) return;
    try {
        const result = await axios.get(`${BASE_URL}/${address}List/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
}