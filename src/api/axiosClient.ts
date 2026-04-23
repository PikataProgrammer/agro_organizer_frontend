import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:5236',
    withCredentials: true
});


api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Сесията е изтекла. Пренасочване към вход...");

            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');

            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);