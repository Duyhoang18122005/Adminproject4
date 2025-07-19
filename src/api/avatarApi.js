import axios from './axiosConfig';

// Get avatar as blob with authentication
export const getAvatarBlob = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/auth/avatar/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching avatar:', error);
    throw error;
  }
};

// Convert blob to data URL
export const blobToDataUrl = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Get avatar as data URL
export const getAvatarDataUrl = async (userId) => {
  try {
    const blob = await getAvatarBlob(userId);
    return await blobToDataUrl(blob);
  } catch (error) {
    console.error('Error converting avatar to data URL:', error);
    throw error;
  }
}; 