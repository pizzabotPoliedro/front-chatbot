import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.10:5000', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export default api;
