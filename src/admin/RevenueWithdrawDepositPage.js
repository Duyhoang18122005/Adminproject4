// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import { useEffect, useState } from 'react';
import { fetchTopupUsers, fetchWithdrawUsers } from '../api/CallApiManagePayment';
import AdminLayout from './AdminLayout';
import { getAvatarUrl } from '../utils/imageUtils';

const RevenueWithdrawDepositPage = () => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositFilter, setDepositFilter] = useState('all');
  const [withdrawFilter, setWithdrawFilter] = useState('all');
  const [searchDeposit, setSearchDeposit] = useState('');
  const [searchWithdraw, setSearchWithdraw] = useState('');
  const [depositOrders, setDepositOrders] = useState([]);
  const [selectedDepositOrder, setSelectedDepositOrder] = useState(null);
  const [withdrawOrders, setWithdrawOrders] = useState([]);
  const [selectedWithdrawOrder, setSelectedWithdrawOrder] = useState(null);
  const [showWithdrawDetail, setShowWithdrawDetail] = useState(false);
  const [showDepositDetail, setShowDepositDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch deposit orders
        const depositData = await fetchTopupUsers(token);
        const mappedDeposits = depositData.map(item => ({
          id: item.id,
          user: { name: item.fullName, avatar: getAvatarUrl(item.avatarUrl, item.id) },
          accountType: 'Người chơi',
          date: new Date(item.createdAt).toLocaleDateString('vi-VN'),
          amount: item.coin.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }),
          status: item.status === 'COMPLETED' ? 'processed' : (item.status === 'PENDING' ? 'pending' : 'rejected'),
          actions: ['view'],
          phoneNumber: item.phoneNumber,
          method: item.method,
          originalData: item
        }));
        setDepositOrders(mappedDeposits);

        // Fetch withdraw orders
        const withdrawData = await fetchWithdrawUsers(token);
        const mappedWithdraws = withdrawData.map(item => ({
          id: item.id,
          user: { name: item.fullName, avatar: getAvatarUrl(item.avatarUrl, item.id) },
          accountType: item.accountType || 'Người chơi',
          date: new Date(item.createdAt).toLocaleDateString('vi-VN'),
          amount: item.coin.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }),
          status: item.status === 'COMPLETED' ? 'processed' : (item.status === 'PENDING' ? 'pending' : 'rejected'),
          actions: ['view'],
          phoneNumber: item.phoneNumber,
          method: item.method,
          originalData: item
        }));
        setWithdrawOrders(mappedWithdraws);
      } catch (err) {
        console.error('Error fetching data:', err);
        setDepositOrders([]);
        setWithdrawOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter deposit orders based on status and search
  const filteredDepositOrders = depositOrders.filter(order => {
    const matchesFilter = depositFilter === 'all' ||
      (depositFilter === 'processed' && order.status === 'processed') ||
      (depositFilter === 'pending' && order.status === 'pending') ||
      (depositFilter === 'rejected' && order.status === 'rejected');

    const search = searchDeposit.trim().toLowerCase();
    const idMatch = order.id && order.id.toString().toLowerCase().includes(search);
    const nameMatch = order.user && order.user.name && order.user.name.toLowerCase().includes(search);
    const matchesSearch = !search || idMatch || nameMatch;

    return matchesFilter && matchesSearch;
  });

  // Filter withdraw orders based on status and search
  const filteredWithdrawOrders = withdrawOrders.filter(order => {
    const matchesFilter = withdrawFilter === 'all' ||
      (withdrawFilter === 'processed' && order.status === 'processed') ||
      (withdrawFilter === 'pending' && order.status === 'pending') ||
      (withdrawFilter === 'rejected' && order.status === 'rejected');

    const matchesSearch = searchWithdraw === '' ||
      order.id.toString().toLowerCase().includes(searchWithdraw.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchWithdraw.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Get status badge color and text
  const getStatusBadge = (status, tab) => {
    if (tab === 'withdraw') {
      switch (status) {
        case 'processed':
          return {
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            text: 'Đã rút',
            icon: '✓'
          };
        case 'pending':
          return {
            color: 'bg-amber-50 text-amber-700 border-amber-200',
            text: 'Đang chờ',
            icon: '⏳'
          };
        case 'rejected':
          return {
            color: 'bg-red-50 text-red-700 border-red-200',
            text: 'Không thành công',
            icon: '✕'
          };
        default:
          return {
            color: 'bg-gray-50 text-gray-700 border-gray-200',
            text: 'Không xác định',
            icon: '?'
          };
      }
    } else {
      switch (status) {
        case 'processed':
          return {
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            text: 'Đã xử lý',
            icon: '✓'
          };
        case 'pending':
          return {
            color: 'bg-amber-50 text-amber-700 border-amber-200',
            text: 'Đang chờ',
            icon: '⏳'
          };
        case 'rejected':
          return {
            color: 'bg-red-50 text-red-700 border-red-200',
            text: 'Không thành công',
            icon: '✕'
          };
        default:
          return {
            color: 'bg-gray-50 text-gray-700 border-gray-200',
            text: 'Không xác định',
            icon: '?'
          };
      }
    }
  };

  const DetailModal = ({ isOpen, onClose, data, type }) => {
    if (!isOpen || !data) return null;

    const isDeposit = type === 'deposit';
    const statusBadge = getStatusBadge(data.status, type);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className={`bg-gradient-to-r ${isDeposit ? 'from-emerald-500 to-teal-600' : 'from-purple-500 to-pink-600'} p-8 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Chi tiết {isDeposit ? 'nạp tiền' : 'rút tiền'}
                </h3>
                <p className="text-white/80">
                  Thông tin chi tiết về giao dịch #{data.id}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-white/80 transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
            <div className="space-y-8">
              {/* User Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin người dùng
                </h4>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={data.user.avatar}
                      alt={data.user.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=' + data.user.name.charAt(0);
                      }}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${isDeposit ? 'bg-emerald-500' : 'bg-purple-500'} rounded-full border-2 border-white flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-2xl font-bold text-blue-900 mb-2">{data.user.name}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                          <span className="font-medium text-blue-700">ID người dùng:</span>
                          <span className="font-semibold text-blue-900">#{data.id}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                          <span className="font-medium text-blue-700">Loại tài khoản:</span>
                          <span className="font-semibold text-blue-900">{data.accountType}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {data.phoneNumber && (
                          <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                            <span className="font-medium text-blue-700">Số điện thoại:</span>
                            <span className="font-semibold text-blue-900">{data.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                          <span className="font-medium text-blue-700">Ngày tạo:</span>
                          <span className="font-semibold text-blue-900">{data.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Information */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                  <h4 className="text-xl font-bold text-emerald-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Thông tin giao dịch
                  </h4>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white rounded-xl">
                      <div className="text-3xl font-bold text-emerald-600 mb-1">{data.amount}</div>
                      <div className="text-sm text-emerald-700">Số tiền giao dịch</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-emerald-700">Phương thức:</span>
                        <span className="font-semibold text-emerald-900">{data.method || 'Không xác định'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-emerald-700">Loại giao dịch:</span>
                        <span className="font-semibold text-emerald-900">
                          {isDeposit ? 'Nạp tiền vào tài khoản' : 'Rút tiền từ tài khoản'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <h4 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Trạng thái giao dịch
                  </h4>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white rounded-xl">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${statusBadge.color}`}>
                        <span className="mr-2">{statusBadge.icon}</span>
                        {statusBadge.text}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-amber-700">Mã giao dịch:</span>
                        <span className="font-semibold text-amber-900">#{data.id}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="font-medium text-amber-700">Thời gian:</span>
                        <span className="font-semibold text-amber-900">{data.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thông tin bổ sung
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                      <span className="font-medium text-gray-700">Phương thức thanh toán:</span>
                      <span className="font-semibold text-gray-900">{data.method || 'Chưa xác định'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                      <span className="font-medium text-gray-700">Loại tài khoản:</span>
                      <span className="font-semibold text-gray-900">{data.accountType}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                      <span className="font-medium text-gray-700">Trạng thái:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.color}`}>
                        {statusBadge.icon} {statusBadge.text}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                      <span className="font-medium text-gray-700">Ngày xử lý:</span>
                      <span className="font-semibold text-gray-900">{data.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className={`px-8 py-3 ${isDeposit ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-xl transition-colors font-medium`}
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
      <AdminLayout breadcrumb="Quản lý giao dịch">
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
    <AdminLayout breadcrumb="Quản lý giao dịch">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quản lý giao dịch</h1>
              <p className="text-indigo-100 text-lg">
                Theo dõi và quản lý các giao dịch nạp tiền và rút tiền
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="flex space-x-2">
            <button
              className={`flex-1 px-6 py-4 font-medium text-sm rounded-xl transition-all duration-200 ${
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('deposit')}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Nạp tiền ({depositOrders.length})</span>
              </div>
            </button>
            <button
              className={`flex-1 px-6 py-4 font-medium text-sm rounded-xl transition-all duration-200 ${
                activeTab === 'withdraw'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('withdraw')}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Rút tiền ({withdrawOrders.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'deposit' ? (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm theo ID hoặc tên người dùng..."
                      value={searchDeposit}
                      onChange={(e) => setSearchDeposit(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="md:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={depositFilter}
                    onChange={(e) => setDepositFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="all">Tất cả</option>
                    <option value="processed">Đã xử lý</option>
                    <option value="pending">Đang chờ</option>
                    <option value="rejected">Không thành công</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Deposit Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredDepositOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={order.user.avatar}
                              alt={order.user.name}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=' + order.user.name.charAt(0);
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                              <div className="text-sm text-gray-500">ID: {order.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{order.amount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.method || 'Không xác định'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status, 'deposit').color}`}>
                            {getStatusBadge(order.status, 'deposit').icon} {getStatusBadge(order.status, 'deposit').text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedDepositOrder(order);
                              setShowDepositDetail(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredDepositOrders.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">Không có giao dịch nạp tiền nào</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm theo ID hoặc tên người dùng..."
                      value={searchWithdraw}
                      onChange={(e) => setSearchWithdraw(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="md:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={withdrawFilter}
                    onChange={(e) => setWithdrawFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="all">Tất cả</option>
                    <option value="processed">Đã rút</option>
                    <option value="pending">Đang chờ</option>
                    <option value="rejected">Không thành công</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Withdraw Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredWithdrawOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={order.user.avatar}
                              alt={order.user.name}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=' + order.user.name.charAt(0);
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                              <div className="text-sm text-gray-500">ID: {order.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{order.amount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.method || 'Không xác định'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status, 'withdraw').color}`}>
                            {getStatusBadge(order.status, 'withdraw').icon} {getStatusBadge(order.status, 'withdraw').text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedWithdrawOrder(order);
                              setShowWithdrawDetail(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredWithdrawOrders.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">Không có giao dịch rút tiền nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        <DetailModal
          isOpen={showDepositDetail}
          onClose={() => setShowDepositDetail(false)}
          data={selectedDepositOrder}
          type="deposit"
        />
        <DetailModal
          isOpen={showWithdrawDetail}
          onClose={() => setShowWithdrawDetail(false)}
          data={selectedWithdrawOrder}
          type="withdraw"
        />
      </div>
    </AdminLayout>
  );
};

export default RevenueWithdrawDepositPage;
