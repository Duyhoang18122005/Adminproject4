import axios from './axiosConfig';

export const fetchReports = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('/reports', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách báo cáo:', error);
        return [];
    }
};

export const banPlayerById = async (id, reason, description) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`/game-players/ban/${id}`, {
            reason,
            description,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi ban người chơi:', error);
        throw error;
    }
};

export const unbanPlayerById = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.post(`/game-players/unban/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi unban người chơi:', error);
        throw error;
    }
};

export const updateReportStatus = async (reportId, status, resolution) => {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.put(`/reports/${reportId}/status`, {
            status,
            resolution,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái báo cáo:', error);
        throw error;
    }
};