// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import axiosInstance from '../api/axiosConfig';
import { getAvatarUrl } from '../utils/imageUtils';

function Order() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [orderId, setOrderId] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/orders/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(res.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'Tất cả' || order.statusLabel === activeTab;
    const matchesSearch =
      (order.renterName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.playerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrderId = !orderId || String(order.id).toLowerCase().includes(orderId.toLowerCase());
    const matchesPrice = (!priceRange.min || order.price >= parseInt(priceRange.min)) &&
      (!priceRange.max || order.price <= parseInt(priceRange.max));
    return matchesTab && matchesSearch && matchesOrderId && matchesPrice;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => b.id - a.id);

  const totalPages = Math.ceil(sortedOrders.length / rowsPerPage);
  const indexOfLastOrder = currentPage * rowsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const getStatusColor = (statusLabel) => {
    switch (statusLabel) {
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' xu';
  };

  const handleViewOrderDetails = async (id) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(`/orders/detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrderDetail(res.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setOrderDetail(null);
    }
    setLoadingDetail(false);
  };

  const handleDeleteOrder = async (order) => {
    if (order.status !== 'COMPLETED') {
      alert('Chỉ có thể xóa đơn đã hoàn thành (COMPLETED)');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev => prev.filter(o => o.id !== order.id));
      alert('Xóa đơn thành công!');
    } catch (err) {
      alert(err.response?.data || 'Không thể xóa đơn!');
    }
  };

  const countOrdersByStatus = (statusLabel) => {
    if (statusLabel === 'Tất cả') return orders.length;
    return orders.filter(order => order.statusLabel === statusLabel).length;
  };

  const DetailModal = ({ isOpen, onClose, data, loading }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Chi tiết đơn hàng</h3>
                <p className="text-indigo-100">Thông tin chi tiết về đơn hàng #{data?.id}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-100 transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
                </div>
              </div>
            ) : data ? (
              <div className="space-y-8">


                {/* Order Overview */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-blue-900">Tổng quan đơn hàng</h4>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(data.status)}`}>
                      {data.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">#{data.id}</div>
                      <div className="text-sm text-blue-700">Mã đơn hàng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">{formatPrice(data.totalCoin)}</div>
                      <div className="text-sm text-green-700">Tổng tiền</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">{data.hours || 0}h</div>
                      <div className="text-sm text-purple-700">Thời gian thuê</div>
                    </div>
                  </div>
                </div>

                {/* Game Information */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                  <h4 className="text-xl font-bold text-emerald-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thông tin game
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-emerald-700">Tên game:</span>
                        <span className="font-semibold text-emerald-900">{data.game || 'Không xác định'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-emerald-700">Rank yêu cầu:</span>
                        <span className="font-semibold text-emerald-900">{data.playerRank || 'Không xác định'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-emerald-700">Nền tảng:</span>
                        <span className="font-semibold text-emerald-900">{data.platform || 'PC'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-emerald-700">Yêu cầu đặc biệt:</span>
                        <span className="font-semibold text-emerald-900">{data.specialRequest || 'Không có'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Hirer */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Người thuê
                    </h4>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <img
                          src={`http://localhost:8080/${data.hirerAvatarUrl}`}
                          alt={data.hirerName}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            const name = data.hirerName?.charAt(0) || 'U';
                            e.target.src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                                <rect width="64" height="64" fill="#10B981"/>
                                <text x="32" y="40" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${name}</text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-green-900">{data.hirerName}</h5>
                        <p className="text-green-700">ID: {data.hirerId}</p>
                        <p className="text-sm text-green-600">Khách hàng</p>
                      </div>
                    </div>
                    
                  </div>

                  {/* Player */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Game thủ
                    </h4>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <img
                          src={`http://localhost:8080/${data.playerAvatarUrl}`}
                          alt={data.playerName}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            const name = data.playerName?.charAt(0) || 'P';
                            e.target.src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                                <rect width="64" height="64" fill="#8B5CF6"/>
                                <text x="32" y="40" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${name}</text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-purple-900">{data.playerName}</h5>
                        <p className="text-purple-700">ID: {data.playerId}</p>
                        <p className="text-sm text-purple-600">Game thủ chuyên nghiệp</p>
                      </div>
                    </div>
                    
                  </div>
                </div>





                {/* Additional Information */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <h4 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thông tin bổ sung
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-amber-700">Thời gian bắt đầu:</span>
                        <span className="font-semibold text-amber-900">{data.startTime ? new Date(data.startTime).toLocaleString('vi-VN') : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-amber-700">Số giờ thuê:</span>
                        <span className="font-semibold text-amber-900">{data.hours || 0} giờ</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-amber-700">Phương thức thanh toán:</span>
                        <span className="font-semibold text-amber-900">{data.paymentMethod || 'Chưa xác định'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-amber-700">Ghi chú:</span>
                        <span className="font-semibold text-amber-900">{data.notes || 'Không có'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải thông tin</h3>
                <p className="text-gray-500">Vui lòng thử lại sau hoặc liên hệ hỗ trợ</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumb="Quản lý đơn hàng">
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
    <AdminLayout breadcrumb="Quản lý đơn hàng">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quản lý đơn hàng</h1>
              <p className="text-blue-100 text-lg">
                Theo dõi và quản lý tất cả đơn hàng thuê game thủ
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tên người thuê/chơi..."
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã đơn</label>
              <input
                type="text"
                placeholder="Nhập mã đơn..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Giá từ (xu)</label>
              <input
                type="number"
                placeholder="Giá tối thiểu..."
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Giá đến (xu)</label>
              <input
                type="number"
                placeholder="Giá tối đa..."
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="flex flex-wrap gap-2">
            {['Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đang diễn ra', 'Đã hoàn thành', 'Bị hủy'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab} ({countOrdersByStatus(tab)})
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>

                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người thuê</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người chơi</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">{order.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`http://localhost:8080/${order.renterAvatarUrl}`}
                          alt={order.renterName}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            const name = order.renterName?.charAt(0) || 'U';
                            e.target.src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" fill="#10B981"/>
                                <text x="20" y="25" font-family="Arial" font-size="16" fill="white" text-anchor="middle">${name}</text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.renterName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`http://localhost:8080/${order.playerAvatarUrl}`}
                          alt={order.playerName}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            const name = order.playerName?.charAt(0) || 'P';
                            e.target.src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" fill="#8B5CF6"/>
                                <text x="20" y="25" font-family="Arial" font-size="16" fill="white" text-anchor="middle">${name}</text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.playerName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.timeRange}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatPrice(order.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.statusLabel)}`}>
                        {order.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewOrderDetails(order.id)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Xem chi tiết"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {order.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Xóa đơn"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {currentOrders.length === 0 && (
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
                Hiển thị {indexOfFirstOrder + 1} đến {Math.min(indexOfLastOrder, sortedOrders.length)} trong tổng số {sortedOrders.length} đơn hàng
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

        {/* Detail Modal */}
        <DetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          data={orderDetail}
          loading={loadingDetail}
        />
      </div>
    </AdminLayout>
  );
}

export default Order;