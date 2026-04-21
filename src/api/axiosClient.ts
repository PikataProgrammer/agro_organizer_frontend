import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:5236',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})

// api.interceptors.response.use((response) =>
//     response,
//         async(error) => {
//             return Promise.reject(error);
//         }
// )
