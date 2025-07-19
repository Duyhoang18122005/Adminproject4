import axios from './axiosConfig';

// Get all notifications for admin
export const getAdminNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    throw error;
  }
};

// Get unread notifications for admin
export const getUnreadNotifications = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/admin/notifications/unread', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/admin/notifications/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`/admin/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/admin/notifications/mark-all-read', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`/admin/notifications/${notificationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get notifications by type
export const getNotificationsByType = async (type) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/admin/notifications/type/${type}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications by type:', error);
    throw error;
  }
}; 