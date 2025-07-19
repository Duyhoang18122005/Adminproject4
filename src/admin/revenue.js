// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import { useEffect, useState } from 'react';
import { fetchOrderStats, fetchOrderSummary } from '../api/CallApidashboard';
import AdminLayout from './AdminLayout';
import { getAvatarUrl } from '../utils/imageUtils';

const Payment = () => {
  const [timeFilter, setTimeFilter] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [apiStats, setApiStats] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayConfirmedOrders = orders.filter(order => order.statusLabel === 'Đã xác nhận' && order.date === todayStr);
  
  const statistics = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (["Bị hủy", "Chờ xác nhận"].includes(order.statusLabel) ? 0 : Math.round(order.price * 0.1)), 0),
    todayRevenue: todayConfirmedOrders.length > 0 ? Math.round(todayConfirmedOrders.reduce((sum, order) => sum + order.price, 0) * 0.1) : 0,
    averageRevenuePerOrder: orders.length > 0 ? Math.round(orders.reduce((sum, order) => sum + (["Bị hủy", "Chờ xác nhận"].includes(order.statusLabel) ? 0 : Math.round(order.price * 0.1)), 0) / orders.length) : 0
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [stats, orderData] = await Promise.all([
          fetchOrderStats(),
          fetchOrderSummary()
        ]);
        
        if (stats) {
          setApiStats({
            totalOrders: stats.totalOrders,
            totalRevenue: stats.totalRevenue
          });
        }
        
        setOrders(Array.isArray(orderData) ? orderData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredOrders = orders
    .filter(order => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.id.toString().toLowerCase().includes(searchLower) ||
          // Khách hàng
          (order.renterName && order.renterName.toLowerCase().includes(searchLower)) ||
          // Game thủ
          (order.playerName && order.playerName.toLowerCase().includes(searchLower)) ||
          // Game
          (order.game && order.game.toLowerCase().includes(searchLower)) ||
          // Thời gian
          (order.timeRange && order.timeRange.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortColumn === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortColumn === 'total') {
        return sortDirection === 'asc' ? a.total - b.total : b.total - a.total;
      } else if (sortColumn === 'adminFee') {
        return sortDirection === 'asc' ? a.adminFee - b.adminFee : b.adminFee - a.adminFee;
      }
      return 0;
    });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0
    }).format(amount) + ' xu';
  };

  const selectedDate = startDate || todayStr;

  let filteredOrdersByDate;
  if (timeFilter === 'today') {
    filteredOrdersByDate = orders;
  } else if (timeFilter === 'custom' && startDate) {
    filteredOrdersByDate = orders.filter(order => order.date === selectedDate);
  } else {
    filteredOrdersByDate = orders;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã xác nhận':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Đang diễn ra':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Đã hoàn thành':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Bị hủy':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Chờ xác nhận':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumb="Quản lý doanh thu">
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
    <AdminLayout breadcrumb="Quản lý doanh thu">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quản lý doanh thu</h1>
              <p className="text-emerald-100 text-lg">
                Theo dõi và phân tích doanh thu từ các đơn hàng
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 rounded-xl">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.todayRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">TB/đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.averageRevenuePerOrder)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc thời gian</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setTimeFilter('today');
                setShowDatePicker(false);
              }}
              className={`px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 ${
                timeFilter === 'today'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => {
                setTimeFilter('7days');
                setShowDatePicker(false);
              }}
              className={`px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 ${
                timeFilter === '7days'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => {
                setTimeFilter('30days');
                setShowDatePicker(false);
              }}
              className={`px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 ${
                timeFilter === '30days'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              30 ngày qua
            </button>
            <button
              onClick={() => {
                setTimeFilter('custom');
                setShowDatePicker(true);
              }}
              className={`px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 ${
                timeFilter === 'custom'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Tùy chỉnh
            </button>
          </div>

          {showDatePicker && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn, tên khách hàng, tên game thủ, game hoặc thời gian..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp theo</label>
              <select
                value={`${sortColumn}-${sortDirection}`}
                onChange={(e) => {
                  const [column, direction] = e.target.value.split('-');
                  setSortColumn(column);
                  setSortDirection(direction);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="date-desc">Ngày (Mới nhất)</option>
                <option value="date-asc">Ngày (Cũ nhất)</option>
                <option value="total-desc">Tổng tiền (Cao nhất)</option>
                <option value="total-asc">Tổng tiền (Thấp nhất)</option>
                <option value="adminFee-desc">Phí admin (Cao nhất)</option>
                <option value="adminFee-asc">Phí admin (Thấp nhất)</option>
              </select>
            </div>
          </div>
        </div>



        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game thủ</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phí admin</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getAvatarUrl(order.renterAvatarUrl, order.id)}
                          alt={order.renterName}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            const name = order.renterName || 'K';
                            e.target.src = 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=' + name.charAt(0);
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.renterName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Khách hàng
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getAvatarUrl(order.playerAvatarUrl, order.id)}
                          alt={order.playerName}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            const name = order.playerName || 'G';
                            e.target.src = 'https://via.placeholder.com/32x32/8B5CF6/FFFFFF?text=' + name.charAt(0);
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.playerName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Game thủ
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {order.game || 'Game'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.timeRange || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(order.total || order.price || 0)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(order.adminFee || Math.round((order.total || order.price || 0) * 0.1))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.statusLabel)}`}>
                        {order.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.date}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {paginatedOrders.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">Không có đơn hàng nào</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Payment; 