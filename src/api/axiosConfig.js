// src/api/axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080/api', // backend Spring Boot chạy ở đây
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
