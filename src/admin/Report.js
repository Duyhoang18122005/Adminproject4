// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import { useEffect, useState } from 'react';
import { banPlayerById, fetchReports, unbanPlayerById, updateReportStatus } from '../api/CallApiReport';
import AdminLayout from './AdminLayout';
import { getAvatarUrl } from '../utils/imageUtils';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random';

const Report = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reports, setReports] = useState([]);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDescription, setBanDescription] = useState('');
  const [banTargetId, setBanTargetId] = useState(null);
  const [banLoading, setBanLoading] = useState(false);
  const [banError, setBanError] = useState('');
  const [banStatus, setBanStatus] = useState('RESOLVED');
  const [banResolution, setBanResolution] = useState('Đã xử lý vi phạm');
  const [unbanningIds, setUnbanningIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    setBanReason('');
    setBanDescription('');
    setBanError('');
    setBanStatus('RESOLVED');
    setBanResolution('Đã xử lý vi phạm');
    setSelectedReport(report);
    setShowBanModal(true);
  };

  const handleBanConfirm = async () => {
    if (!banReason.trim()) {
      setBanError('Vui lòng nhập lý do ban.');
      return;
    }
    if (!banStatus) {
      setBanError('Vui lòng chọn trạng thái.');
      return;
    }
    setBanLoading(true);
    setBanError('');
    try {
      await banPlayerById(banTargetId, banReason, banDescription);
      await updateReportStatus(selectedReport.id, banStatus, banResolution);
      setShowBanModal(false);
      setBanLoading(false);
      window.location.reload();
    } catch (e) {
      setBanError('Có lỗi xảy ra khi ban người chơi hoặc cập nhật trạng thái báo cáo.');
      setBanLoading(false);
    }
  };

  const handleUnban = async (report) => {
    const playerId = report.raw.reportedPlayer?.id || report.raw.reportedPlayer?.user?.id;
    setUnbanningIds((prev) => [...prev, playerId]);
    try {
      await unbanPlayerById(playerId);
    } catch (e) {
      console.error('Error unbanning player:', e);
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
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }, [isOpen]);

    if (!isOpen || !data) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
        style={{ 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          overflow: 'hidden'
        }}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-t-3xl z-10">
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

          {/* Content */}
          <div className="p-6 pt-8">
            <div className="space-y-8">
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
                    >
                      <source src={data.videoUrl} type="video/mp4" />
                      <source src={data.videoUrl} type="video/webm" />
                      <source src={data.videoUrl} type="video/ogg" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                    <span>
                      <i className="fas fa-info-circle mr-1"></i>
                      Video bằng chứng vi phạm
                    </span>
                    <a
                      href={data.videoUrl}
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

            {/* Action Buttons */}
            <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
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
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
        style={{ 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          overflow: 'hidden'
        }}
      >
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Ban người chơi</h3>
          </div>
          
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lý do ban *</label>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Nhập lý do ban..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
              <textarea
                value={banDescription}
                onChange={(e) => setBanDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Mô tả chi tiết lý do ban..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái báo cáo</label>
              <select
                value={banStatus}
                onChange={(e) => setBanStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="RESOLVED">Đã xử lý</option>
                <option value="IGNORED">Bỏ qua</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú xử lý</label>
              <input
                type="text"
                value={banResolution}
                onChange={(e) => setBanResolution(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Ghi chú xử lý..."
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              onClick={handleBanConfirm}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận ban'}
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
    </AdminLayout>
  );
};

export default Report;