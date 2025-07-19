import axios from './axiosConfig';

export const fetchPlayers = async () => {
  const res = await axios.get('/game-players');
  return res.data.data; // Truy cập vào `data` trong ApiResponse
};
export const getPlayerById = async (id) => {
  const res = await axios.get(`/game-players/${id}`);
  return res.data.data; // vì backend trả về { success, message, data }
};

// Get user info by avatar URL
export const getUserByAvatarUrl = async (avatarUrl) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/users/avatar/${encodeURIComponent(avatarUrl)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user by avatar URL:', error);
    return null;
  }
};