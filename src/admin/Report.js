// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchReports, updateReportStatus, banPlayerById, unbanPlayerById } from '../api/CallApiReport';
import { getAvatarUrl } from '../utils/imageUtils';
import axios from '../api/axiosConfig';

// CSS để đảm bảo modal che phủ hoàn toàn
const modalStyles = `
  .modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 999999 !important;
    background-color: rgba(0, 0, 0, 0.6) !important;
  }
  
  .modal-overlay * {
    z-index: inherit !important;
  }
`;

// Thêm CSS vào head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = modalStyles;
  document.head.appendChild(style);
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random';

// Function để lấy video URL trực tiếp
const getVideoUrl = (videoUrl) => {
  if (!videoUrl) return null;
  
  const filename = videoUrl.split('/').pop();
  const token = localStorage.getItem('token');
  
  console.log('Video filename:', filename);
  console.log('Token present:', !!token);
  
  // URL trực tiếp từ backend với Bearer token
  const directVideoUrl = `http://localhost:8080/api/files/videos/${filename}?authorization=Bearer%20${encodeURIComponent(token)}`;
  
  console.log('Direct video URL:', directVideoUrl);
  return directVideoUrl;
};

const Report = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reports, setReports] = useState([]);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banTargetId, setBanTargetId] = useState(null);
  const [banError, setBanError] = useState('');
  const [banLoading, setBanLoading] = useState(false);
  const [banStatus, setBanStatus] = useState('RESOLVED');
  const [banResolution, setBanResolution] = useState('Đã xử lý vi phạm');
  const [unbanningIds, setUnbanningIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const getReports = async () => {
      setIsLoading(true);
      try {
        const data = await fetchReports();
        const mapped = data.map((item) => ({
          id: item.id,
          reporter: item.reporter?.username || '',
          reporterAvatar: getAvatarUrl(item.reporter?.avatarUrl, item.reporter?.id),
          reportedUser: item.reportedPlayer?.user?.username || '',
          reportedUserAvatar: getAvatarUrl(item.reportedPlayer?.user?.avatarUrl, item.reportedPlayer?.user?.id),
          content: item.reason + (item.description ? `: ${item.description}` : ''),
          time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
          status: item.status ? item.status.toLowerCase() : 'pending',
          videoUrl: item.videoUrl || null,
          raw: item,
        }));
        setReports(mapped);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };
    getReports();
  }, []);

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleBanClick = (report) => {
    setBanTargetId(report.raw.reportedPlayer?.id || report.raw.reportedPlayer?.user?.id);
    // Lấy lý do ban và mô tả từ API
    setBanError('');
    setBanStatus('RESOLVED');
    setBanResolution('Đã xử lý vi phạm');
    setSelectedReport(report);
    setShowBanModal(true);
  };

  const handleBanConfirm = async () => {
    const reasonFromApi = selectedReport.raw.reason || '';
    const descriptionFromApi = selectedReport.raw.description || '';
    
    if (!reasonFromApi.trim()) {
      setBanError('Không có lý do ban từ báo cáo.');
      return;
    }
    if (!banStatus) {
      setBanError('Vui lòng chọn trạng thái.');
      return;
    }
    setBanLoading(true);
    setBanError('');
    try {
      await banPlayerById(banTargetId, reasonFromApi, descriptionFromApi);
      await updateReportStatus(selectedReport.id, banStatus, banResolution);
      setShowBanModal(false);
      setBanLoading(false);
      
      // Refresh reports data
      const data = await fetchReports();
      const mapped = data.map((item) => ({
        id: item.id,
        reporter: item.reporter?.username || '',
        reporterAvatar: getAvatarUrl(item.reporter?.avatarUrl, item.reporter?.id),
        reportedUser: item.reportedPlayer?.user?.username || '',
        reportedUserAvatar: getAvatarUrl(item.reportedPlayer?.user?.avatarUrl, item.reportedPlayer?.user?.id),
        content: item.reason + (item.description ? `: ${item.description}` : ''),
        time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
        status: item.status ? item.status.toLowerCase() : 'pending',
        videoUrl: item.videoUrl || null,
        raw: item,
      }));
      setReports(mapped);
      
      showNotification('Ban người chơi thành công!', 'success');
    } catch (e) {
      console.error('Error banning player:', e);
      setBanError('Có lỗi xảy ra khi ban người chơi hoặc cập nhật trạng thái báo cáo.');
      setBanLoading(false);
      showNotification('Có lỗi khi ban người chơi!', 'error');
    }
  };

  const handleUnban = async (report) => {
    const playerId = report.raw.reportedPlayer?.id || report.raw.reportedPlayer?.user?.id;
    setUnbanningIds((prev) => [...prev, playerId]);
    try {
      await unbanPlayerById(playerId);
      
      // Refresh reports data
      const data = await fetchReports();
      const mapped = data.map((item) => ({
        id: item.id,
        reporter: item.reporter?.username || '',
        reporterAvatar: getAvatarUrl(item.reporter?.avatarUrl, item.reporter?.id),
        reportedUser: item.reportedPlayer?.user?.username || '',
        reportedUserAvatar: getAvatarUrl(item.reportedPlayer?.user?.avatarUrl, item.reportedPlayer?.user?.id),
        content: item.reason + (item.description ? `: ${item.description}` : ''),
        time: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
        status: item.status ? item.status.toLowerCase() : 'pending',
        videoUrl: item.videoUrl || null,
        raw: item,
      }));
      setReports(mapped);
      
      showNotification('Mở khóa người chơi thành công!', 'success');
    } catch (e) {
      console.error('Error unbanning player:', e);
      showNotification('Có lỗi khi mở khóa người chơi!', 'error');
    } finally {
      setUnbanningIds((prev) => prev.filter(id => id !== playerId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ignored':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'banned':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'resolved':
        return 'Đã xử lý';
      case 'ignored':
        return 'Đã bỏ qua';
      case 'banned':
        return 'Đã ban';
      default:
        return status;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const DetailModal = ({ isOpen, onClose, data }) => {
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        // Đảm bảo modal che phủ hoàn toàn
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const zIndex = window.getComputedStyle(el).zIndex;
          if (zIndex && parseInt(zIndex) > 999999) {
            el.style.zIndex = '999998';
          }
        });
      } else {
        document.body.style.overflow = '';
      }
      
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    if (!isOpen || !data) return null;

    return (
      <div 
        className="modal-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[999999] p-4"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-t-3xl z-10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Chi tiết báo cáo</h2>
                  <p className="text-red-100 text-sm">Thông tin chi tiết về vi phạm</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-red-100 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-20"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Report Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-file-alt text-blue-600 mr-2"></i>
                  Thông tin báo cáo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center py-3 border-b border-blue-100">
                    <span className="text-gray-600">Mã báo cáo:</span>
                    <span className="font-semibold text-gray-900">#{data.id}</span>
                </div>
                  <div className="flex justify-between items-center py-3 border-b border-blue-100">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium text-gray-900">{data.time}</span>
                </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(data.status)}`}>
                    {getStatusText(data.status)}
                  </span>
                </div>
              </div>
            </div>

              {/* Users Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-user-check text-green-600 mr-2"></i>
                    Người báo cáo
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                  <img
                    src={data.reporterAvatar}
                    alt={data.reporter}
                        className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=' + (data.reporter?.charAt(0) || 'R');
                    }}
                  />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <i className="fas fa-check text-white text-xs"></i>
                      </div>
                    </div>
                  <div>
                      <h5 className="font-bold text-gray-900 text-lg">{data.reporter}</h5>
                      <p className="text-green-600 font-medium">Người báo cáo</p>
                      <p className="text-sm text-gray-500 mt-1">Đã gửi báo cáo vi phạm</p>
                    </div>
                </div>
              </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-user-times text-red-600 mr-2"></i>
                    Người bị báo cáo
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                  <img
                    src={data.reportedUserAvatar}
                    alt={data.reportedUser}
                        className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x64/EF4444/FFFFFF?text=' + (data.reportedUser?.charAt(0) || 'U');
                    }}
                  />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                        <i className="fas fa-exclamation text-white text-xs"></i>
                      </div>
                    </div>
                  <div>
                      <h5 className="font-bold text-gray-900 text-lg">{data.reportedUser}</h5>
                      <p className="text-red-600 font-medium">Người bị tố cáo</p>
                      <p className="text-sm text-gray-500 mt-1">Có hành vi vi phạm</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="fas fa-comment-alt text-indigo-600 mr-2"></i>
                  Nội dung báo cáo
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed">{data.content || 'Không có nội dung'}</p>
              </div>
            </div>

              {/* Video Evidence */}
              {data.videoUrl && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-video text-orange-600 mr-2"></i>
                    Video bằng chứng
                  </h4>
                  <div className="bg-gray-900 rounded-xl overflow-hidden">
                    <video
                      controls
                      className="w-full h-auto max-h-96 object-contain"
                      poster="/images/video-placeholder.jpg"
                      onLoadStart={() => {}}
                      onCanPlay={() => {}}
                      onError={() => {}}
                    >
                      <source src={getVideoUrl(data.videoUrl)} type="video/mp4" />
                      <source src={getVideoUrl(data.videoUrl)} type="video/webm" />
                      <source src={getVideoUrl(data.videoUrl)} type="video/ogg" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <span>
                      <i className="fas fa-info-circle mr-1"></i>
                      Video bằng chứng vi phạm
                    </span>
                    <a
                      href={getVideoUrl(data.videoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
                    >
                      <i className="fas fa-external-link-alt mr-1"></i>
                      Mở trong tab mới
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 border-t border-gray-100 mt-6 flex-shrink-0 p-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-300 transition-all font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BanModal = ({ isOpen, onClose, data, loading, error }) => {
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        // Đảm bảo modal che phủ hoàn toàn
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const zIndex = window.getComputedStyle(el).zIndex;
          if (zIndex && parseInt(zIndex) > 999999) {
            el.style.zIndex = '999998';
          }
        });
      } else {
        document.body.style.overflow = '';
      }
      
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div 
        className="modal-overlay fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[999999] p-4"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-t-3xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <i className="fas fa-ban text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Ban người chơi</h3>
                  <p className="text-red-100 text-sm">Xác nhận việc cấm người chơi vi phạm</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-red-100 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-20"
                disabled={loading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                  <i className="fas fa-exclamation-triangle text-red-600 text-xs"></i>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* User Info */}
            {data && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={data.reportedUserAvatar}
                    alt={data.reportedUser}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48/EF4444/FFFFFF?text=' + (data.reportedUser?.charAt(0) || 'U');
                    }}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{data.reportedUser}</h4>
                    <p className="text-sm text-gray-600">ID: {data.raw?.reportedPlayer?.id || data.raw?.reportedPlayer?.user?.id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lý do ban <span className="text-red-500">*</span>
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                  {data?.raw?.reason || 'Không có lý do ban'}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả chi tiết
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 min-h-[80px]">
                  {data?.raw?.description || 'Không có mô tả chi tiết'}
                </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái báo cáo
                  </label>
              <select
                value={banStatus}
                onChange={(e) => setBanStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="RESOLVED">Đã xử lý</option>
                <option value="IGNORED">Bỏ qua</option>
              </select>
            </div>

            <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú xử lý
                  </label>
              <input
                type="text"
                value={banResolution}
                onChange={(e) => setBanResolution(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Ghi chú xử lý..."
              />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex justify-end space-x-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border border-gray-300 transition-all font-medium"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              onClick={handleBanConfirm}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-ban"></i>
                  <span>Xác nhận ban</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumb="Quản lý vi phạm">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumb="Quản lý vi phạm">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quản lý vi phạm</h1>
              <p className="text-red-100 text-lg">
                Xử lý và quản lý các báo cáo vi phạm từ người dùng
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo tên người dùng hoặc nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Đang chờ xử lý</option>
                <option value="resolved">Đã xử lý</option>
                <option value="ignored">Đã bỏ qua</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                Lọc báo cáo
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Báo cáo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người báo cáo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người bị báo cáo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">#{report.id}</div>
                      <div className="text-sm text-gray-500">{report.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={report.reporterAvatar}
                          alt={report.reporter}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=' + (report.reporter?.charAt(0) || 'R');
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.reporter}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={report.reportedUserAvatar}
                          alt={report.reportedUser}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x40/EF4444/FFFFFF?text=' + (report.reportedUser?.charAt(0) || 'U');
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.reportedUser}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{report.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(report)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Xem chi tiết"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleBanClick(report)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Ban người chơi"
                        >
                          <i className="fas fa-ban text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleUnban(report)}
                          disabled={unbanningIds.includes(report.raw.reportedPlayer?.id || report.raw.reportedPlayer?.user?.id)}
                          className={`transition-colors ${
                            unbanningIds.includes(report.raw.reportedPlayer?.id || report.raw.reportedPlayer?.user?.id)
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title="Unban người chơi"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">Không có báo cáo vi phạm nào</p>
            </div>
          )}
        </div>

        {/* Modals */}
        <DetailModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          data={selectedReport}
        />
        <BanModal
          isOpen={showBanModal}
          onClose={() => setShowBanModal(false)}
          data={selectedReport}
          loading={banLoading}
          error={banError}
        />
      </div>
      
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Report;