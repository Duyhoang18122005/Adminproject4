import axios from './axiosConfig';

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await axios.get(`/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const userData = response.data;
    
    // Add avatar URL with token for authentication
    if (userData.id) {
      userData.avatarUrl = `http://localhost:8080/api/auth/avatar/${userData.id}?token=${token}`;
    }
    
    return userData;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put('/users/profile', userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Upload avatar
export const uploadAvatar = async (file) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await axios.post('/users/avatar', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}; 