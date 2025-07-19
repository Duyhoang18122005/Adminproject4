// src/api/gameService.js
import axios from './axiosConfig';

export const fetchGames = async () => {
  try {
    const response = await axios.get('/games');
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách game:", error);
    return [];
  }
};
