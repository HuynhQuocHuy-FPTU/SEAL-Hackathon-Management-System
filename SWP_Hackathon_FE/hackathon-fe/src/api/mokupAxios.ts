import axios from "axios";
export const API_BASE_URL = 'https://6a2d0ca42edd4cb330d0c13c.mockapi.io/api/swp391';
const axiosClientTest = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});
export default axiosClientTest;