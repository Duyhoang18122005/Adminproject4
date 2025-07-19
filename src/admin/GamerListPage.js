// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import AdminLayout from './AdminLayout';
import { getAvatarUrl } from '../utils/imageUtils';

const GamerListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedGamerId, setSelectedGamerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [selectedGameType, setSelectedGameType] = useState('all');
  const [selectedRank, setSelectedRank] = useState('all');
  const [players, setPlayers] = useState([]);
  const [gameOptions, setGameOptions] = useState([]);
  const [rankOptions, setRankOptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    userId: '',
    gameId: '',
    username: '',
    rank: '',
    role: '',
    server: '',
    pricePerHour: '',
    description: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGamerDetail, setSelectedGamerDetail] = useState(null);

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get('/game-players/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers((res.data.data || []).map(gp => ({
        ...gp,
        fullName: gp.name,
        playerUsername: gp.playerName, // Sửa từ username thành playerName
        orderCount: gp.totalOrders,
        reviewCount: gp.totalReviews,
        income: gp.totalRevenue,
        rank: gp.rankLabel,
        rating: gp.rating || 0, // Đảm bảo rating có giá trị mặc định
      })));
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const games = Array.from(new Set(players.map(p => p.gameName).filter(Boolean)));
    const ranks = Array.from(new Set(players.map(p => p.rank).filter(Boolean)));
    setGameOptions(games);
    setRankOptions(ranks);
  }, [players]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/games', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGames(res.data);
      } catch (err) {
        console.error('Error fetching games:', err);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    const found = games.find(g => String(g.id) === String(addForm.gameId));
    setSelectedGame(found || null);
    setAddForm(f => ({ ...f, rank: '', role: '' }));
  }, [addForm.gameId, games]);

  // Filter gamers
  const filteredGamers = players.filter(gamer => {
    const matchesSearch = (gamer.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gamer.playerUsername || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gamer.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || gamer.status === selectedStatus;
    const matchesRating = true; // Bỏ filter rating vì không có trong UI
    const matchesGame = selectedGameType === 'all' || gamer.gameName === selectedGameType;
    const matchesRank = selectedRank === 'all' || gamer.rank === selectedRank;
    return matchesSearch && matchesStatus && matchesGame && matchesRank;
  });

  // Pagination
  const totalPages = Math.ceil(filteredGamers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGamers = filteredGamers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedGameType('all');
    setSelectedRank('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleToggleGamerStatus = async (gamer) => {
    if (!gamer || !gamer.id) {
      alert('Không tìm thấy ID game thủ!');
      return;
    }
    const isBanned = gamer.status === 'BANNED';
    const confirmMsg = isBanned ? 'Bạn có muốn mở khóa game thủ này không?' : 'Bạn có muốn khóa (ban) game thủ này không?';
    if (!window.confirm(confirmMsg)) return;
    try {
      const token = localStorage.getItem('token');
      const url = isBanned
        ? `/game-players/unban/${gamer.id}`
        : `/game-players/ban/${gamer.id}`;
      await axiosInstance.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers((prev) => prev.map((p) =>
        p.id === gamer.id ? { ...p, status: isBanned ? 'AVAILABLE' : 'BANNED' } : p
      ));
      alert(isBanned ? 'Đã mở khóa game thủ!' : 'Đã khóa game thủ!');
    } catch (err) {
      alert('Có lỗi khi thay đổi trạng thái game thủ!');
    }
  };

  const handleDeleteGamer = async (gamer) => {
    if (!gamer || !gamer.id) {
      alert('Không tìm thấy ID game thủ!');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa game thủ này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`game-players/${gamer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers((prev) => prev.filter((p) => p.id !== gamer.id));
      alert('Đã xóa game thủ thành công!');
    } catch (err) {
      alert('Có lỗi khi xóa game thủ!');
    }
  };

  const getStatusLabel = (status) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'AVAILABLE':
        return { text: 'Hoạt động', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-200', icon: 'fas fa-check-circle' };
      case 'LOCKED':
        return { text: 'Khóa', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200', icon: 'fas fa-lock' };
      case 'PENDING':
        return { text: 'Chờ duyệt', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-200', icon: 'fas fa-clock' };
      case 'BANNED':
        return { text: 'Bị khóa', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200', icon: 'fas fa-ban' };
      default:
        return { text: `Không xác định (${status})`, bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-200', icon: 'fas fa-question-circle' };
    }
  };

  const getRatingLabel = (rating) => {
    const ratingNum = parseFloat(rating) || 0;
    
    if (ratingNum === 0) {
      return { text: 'Chưa đánh giá', bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-200', icon: 'far fa-star' };
    } else if (ratingNum >= 4.5) {
      return { text: `${ratingNum.toFixed(1)} ⭐`, bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', borderColor: 'border-indigo-200', icon: 'fas fa-star' };
    } else if (ratingNum >= 3.5) {
      return { text: `${ratingNum.toFixed(1)} ⭐`, bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-200', icon: 'fas fa-star-half-alt' };
    } else if (ratingNum >= 2.5) {
      return { text: `${ratingNum.toFixed(1)} ⭐`, bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-200', icon: 'fas fa-star' };
    } else {
      return { text: `${ratingNum.toFixed(1)} ⭐`, bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200', icon: 'far fa-star' };
    }
  };

  const getGameTypeLabel = (gameType) => {
    switch (gameType) {
      case 'MOBA':
        return { text: 'MOBA', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-200' };
      case 'FPS':
        return { text: 'FPS', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200' };
      case 'RPG':
        return { text: 'RPG', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-200' };
      default:
        return { text: gameType || 'Khác', bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-200' };
    }
  };

  const getToggleStatusText = (status) => {
    return status === 'BANNED' ? 'Mở khóa' : 'Khóa';
  };

  const getToggleStatusIcon = (status) => {
    return status === 'BANNED' ? 'fas fa-unlock' : 'fas fa-lock';
  };

  const handleAddInputChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddGamer = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post('/game-players', addForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddModal(false);
      setAddForm({
        userId: '',
        gameId: '',
        username: '',
        rank: '',
        role: '',
        server: '',
        pricePerHour: '',
        description: '',
      });
      fetchPlayers();
      alert('Thêm game thủ thành công!');
    } catch (err) {
      alert('Có lỗi khi thêm game thủ!');
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewGamerDetail = (gamer) => {
    setSelectedGamerDetail(gamer);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumb="Quản lý Game thủ">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumb="Quản lý Game thủ">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quản lý Game thủ</h1>
              <p className="text-indigo-100 text-lg">
                Quản lý danh sách game thủ và thông tin chi tiết
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="fas fa-gamepad text-4xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tổng game thủ</p>
                <p className="text-3xl font-bold text-gray-900">{players.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Đang hoạt động</p>
                <p className="text-3xl font-bold text-gray-900">
                  {players.filter(p => p.status === 'AVAILABLE').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Bị khóa</p>
                <p className="text-3xl font-bold text-gray-900">
                  {players.filter(p => p.status === 'BANNED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-ban text-red-600 text-xl"></i>
              </div>
            </div>
          </div>


        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách Game thủ</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm game thủ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-gray-400"></i>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Thêm Game thủ
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="AVAILABLE">Hoạt động</option>
                <option value="BANNED">Bị khóa</option>
                <option value="LOCKED">Khóa</option>
              </select>

              {/* Game Type Filter */}
              <select
                value={selectedGameType}
                onChange={(e) => setSelectedGameType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả game</option>
                {gameOptions.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>

              {/* Rank Filter */}
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả rank</option>
                {rankOptions.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-refresh mr-2"></i>
                Đặt lại
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game thủ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game & Rank
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đánh giá
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thống kê
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentGamers.map((gamer) => {
                  const statusLabel = getStatusLabel(gamer.status);
                  const ratingLabel = getRatingLabel(gamer.rating);
                  const gameTypeLabel = getGameTypeLabel(gamer.gameType);
                  
                  return (
                    <tr key={gamer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-12 rounded-xl object-cover border-2 border-gray-100"
                            src={getAvatarUrl(gamer.avatarUrl, gamer.id)}
                            alt={gamer.fullName}
                            onError={e => { e.target.onerror = null; e.target.src = '/images/avata1.jpg'; }}
                          />
                          <div className="ml-4">
                            <div className="text-sm">
                              <span className="text-gray-600">Tên User:</span>
                              <span className="font-medium text-gray-900 ml-1">{gamer.fullName}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Tên Player:</span>
                              <span className="font-medium text-blue-600 ml-1">{gamer.playerUsername}</span>
                            </div>
                            <div className="text-sm text-gray-500">{gamer.email}</div>
                            <div className="text-xs text-gray-400">ID: {gamer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${gameTypeLabel.bgColor} ${gameTypeLabel.textColor} ${gameTypeLabel.borderColor} border`}>
                              {gamer.gameName}
                            </span>
                          </div>
                          {gamer.rank && (
                            <div className="text-sm text-gray-600">
                              <i className="fas fa-trophy mr-1 text-yellow-500"></i>
                              {gamer.rank}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusLabel.bgColor} ${statusLabel.textColor} ${statusLabel.borderColor} border`}>
                          <i className={`${statusLabel.icon} mr-1`}></i>
                          {statusLabel.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${ratingLabel.bgColor} ${ratingLabel.textColor} ${ratingLabel.borderColor} border`}>
                          <i className={`${ratingLabel.icon} mr-1`}></i>
                          {ratingLabel.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm space-y-1">
                          <div className="text-gray-600">
                            <i className="fas fa-shopping-cart mr-1 text-blue-500"></i>
                            {gamer.orderCount || 0} đơn
                          </div>
                          <div className="text-gray-600">
                            <i className="fas fa-star mr-1 text-yellow-500"></i>
                            {gamer.reviewCount || 0} đánh giá
                          </div>
                          <div className="text-gray-600">
                            <i className="fas fa-coins mr-1 text-green-500"></i>
                            {gamer.income ? new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0 }).format(gamer.income) + ' xu' : '0 xu'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewGamerDetail(gamer)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredGamers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-gray-400 text-xl"></i>
              </div>
              <p className="text-gray-500 text-lg">Không tìm thấy game thủ nào</p>
              <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredGamers.length)} trong số {filteredGamers.length} kết quả
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Trước
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            currentPage === pageNumber
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedGamerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-gamepad text-white text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Chi tiết Game thủ</h2>
                    <p className="text-indigo-100 text-sm">Thông tin chi tiết và thống kê</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-indigo-100 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-20"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-8">
              <div className="space-y-8">
                {/* Profile Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <img
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                        src={getAvatarUrl(selectedGamerDetail.avatarUrl, selectedGamerDetail.id)}
                        alt={selectedGamerDetail.fullName}
                        onError={e => { 
                          e.target.onerror = null; 
                          e.target.src = '/images/avata1.jpg'; 
                        }}
                      />
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                        selectedGamerDetail.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        <i className={`fas fa-circle text-xs ${selectedGamerDetail.status === 'AVAILABLE' ? 'text-green-500' : 'text-gray-400'}`}></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {selectedGamerDetail.fullName}
                        </h3>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusLabel(selectedGamerDetail.status).bgColor} ${getStatusLabel(selectedGamerDetail.status).textColor}`}>
                          {getStatusLabel(selectedGamerDetail.status).text}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Tên User:</span>
                          <p className="font-medium text-gray-900">{selectedGamerDetail.fullName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tên Player:</span>
                          <p className="font-medium text-blue-600">{selectedGamerDetail.playerUsername}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Email:</span>
                          <p className="font-medium text-gray-900 break-all">{selectedGamerDetail.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <i className="fas fa-shopping-cart text-blue-600 text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedGamerDetail.orderCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <i className="fas fa-star text-yellow-600 text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tổng đánh giá</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedGamerDetail.reviewCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <i className="fas fa-coins text-green-600 text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tổng thu nhập</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedGamerDetail.income ? new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0 }).format(selectedGamerDetail.income) + ' xu' : '0 xu'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <i className="fas fa-star text-purple-600 text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Đánh giá</p>
                        <div className={`px-2 py-1 text-xs font-semibold rounded-full ${getRatingLabel(selectedGamerDetail.rating).bgColor} ${getRatingLabel(selectedGamerDetail.rating).textColor}`}>
                          {getRatingLabel(selectedGamerDetail.rating).text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-gamepad text-indigo-600 mr-2"></i>
                      Thông tin Game
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium text-gray-900">#{selectedGamerDetail.id}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Game:</span>
                        <span className="font-medium text-gray-900">{selectedGamerDetail.gameName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Rank:</span>
                        <span className="font-medium text-gray-900">{selectedGamerDetail.rank || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i className="fas fa-chart-line text-green-600 mr-2"></i>
                      Hiệu suất
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusLabel(selectedGamerDetail.status).bgColor} ${getStatusLabel(selectedGamerDetail.status).textColor}`}>
                          {getStatusLabel(selectedGamerDetail.status).text}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Đánh giá TB:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRatingLabel(selectedGamerDetail.rating).bgColor} ${getRatingLabel(selectedGamerDetail.rating).textColor}`}>
                          {getRatingLabel(selectedGamerDetail.rating).text}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Thu nhập TB:</span>
                        <span className="font-medium text-gray-900">
                          {selectedGamerDetail.orderCount > 0 && selectedGamerDetail.income 
                            ? new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0 }).format(Math.round(selectedGamerDetail.income / selectedGamerDetail.orderCount)) + ' xu'
                            : '0 xu'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-user-plus text-white text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Thêm Game thủ</h2>
                    <p className="text-blue-100 text-sm">Tạo tài khoản game thủ mới</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-blue-100 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-20"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-8">
              <form onSubmit={handleAddGamer} className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-user text-blue-600 mr-2"></i>
                    Thông tin cơ bản
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
                      <input
                        type="text"
                        name="userId"
                        value={addForm.userId}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Nhập User ID"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                      <input
                        type="text"
                        name="username"
                        value={addForm.username}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Nhập username"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Game Info Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-gamepad text-green-600 mr-2"></i>
                    Thông tin Game
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Game *</label>
                      <select
                        name="gameId"
                        value={addForm.gameId}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Chọn game</option>
                        {games.map(game => (
                          <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Server</label>
                      <input
                        type="text"
                        name="server"
                        value={addForm.server}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Nhập server"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
                      <input
                        type="text"
                        name="rank"
                        value={addForm.rank}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Nhập rank"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        name="role"
                        value={addForm.role}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Nhập role"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-coins text-yellow-600 mr-2"></i>
                    Thông tin giá
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá/giờ (VNĐ) *</label>
                    <input
                      type="number"
                      name="pricePerHour"
                      value={addForm.pricePerHour}
                      onChange={handleAddInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="Nhập giá mỗi giờ"
                      required
                    />
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-file-alt text-purple-600 mr-2"></i>
                    Mô tả
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
                    <textarea
                      name="description"
                      value={addForm.description}
                      onChange={handleAddInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="Mô tả về game thủ, kỹ năng, kinh nghiệm..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isAdding
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    {isAdding ? 'Đang thêm...' : 'Thêm Game thủ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default GamerListPage;
