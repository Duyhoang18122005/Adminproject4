import axios from './axiosConfig';

export const fetchOrderStats = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('/orders/stats', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // Trả về toàn bộ object chứa các thống kê
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy thống kê đơn hàng:', error);
        return null;
    }
};

export const fetchOrderSummary = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('/orders/summary', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        return [];
    }
};

export const fetchRevenueGrowth = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/orders/revenue-growth-percent-yesterday', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue growth:', error);
    return 0;
  }
};
