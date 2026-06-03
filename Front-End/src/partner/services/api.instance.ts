import axios from 'axios';
import { tokenStorage } from '../../login/shared/storage/secure-token.storage';

const apiInstance = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    timeout: 10000,
});

apiInstance.interceptors.request.use(
    async (config) => {
        const token = await tokenStorage.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiInstance.interceptors.response.use(
    (response) => {
        
        return response.data;
    },
    (error) => {
        console.error('Lỗi API:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
export default apiInstance;