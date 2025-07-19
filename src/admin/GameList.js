// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import AdminLayout from "./AdminLayout";
import axiosInstance from '../api/axiosConfig';
import { generateRandomColor } from '../utils/chartUtils';

const GameListPage = () => {
  const [activeTab, setActiveTab] = useState("danhSach");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");
  const [selectedGameType, setSelectedGameType] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [selectedPlatform, setSelectedPlatform] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [games, setGames] = useState([]);
  const [gameCategories, setGameCategories] = useState(["Tất cả"]);
  const [gameStatuses, setGameStatuses] = useState(["Tất cả"]);
  const [categories, setCategories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    platform: '',
    status: '',
    imageUrl: '',
    websiteUrl: '',
    requirements: '',
    hasRoles: false,
    availableRoles: '',
    availableRanks: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    category: '',
    platform: '',
    status: '',
    imageUrl: '',
    websiteUrl: '',
    requirements: '',
    hasRoles: false,
    availableRoles: '',
    availableRanks: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get('/games', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGames(res.data);
      const categories = Array.from(new Set(res.data.map(g => g.category).filter(Boolean)));
      setGameCategories(["Tất cả", ...categories]);
      const statuses = Array.from(new Set(res.data.map(g => g.status).filter(Boolean)));
      setGameStatuses(["Tất cả", ...statuses]);
    } catch (err) {
      console.error('Error fetching games:', err);
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get('/game-categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Categories API response:', res.data);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get('/game-platforms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Platforms API response:', res.data);
      setPlatforms(res.data);
    } catch (err) {
      console.error('Error fetching platforms:', err);
      setPlatforms([]);
    }
  };

  const fetchStatuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get('/game-statuses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Statuses API response:', res.data);
      setStatuses(res.data);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setStatuses([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get('/games/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Dashboard API response:', res.data);
      console.log('Player stats data:', res.data?.playerStats);
      console.log('Game distribution data:', res.data?.gameDistribution);
      setDashboardData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setDashboardData(null);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchCategories();
    fetchPlatforms();
    fetchStatuses();
    fetchDashboardData();
  }, []);

  // Force re-render charts when dashboard data changes
  useEffect(() => {
    if (activeTab === "thongKe" && dashboardData) {
      // Trigger a small delay to ensure DOM is ready
      setTimeout(() => {
        const gameTypeDom = document.getElementById("gameTypeChart");
        const playerStatsDom = document.getElementById("playerStatsChart");
        if (gameTypeDom && playerStatsDom) {
          // Force re-render by dispatching a resize event
          window.dispatchEvent(new Event('resize'));
        }
      }, 100);
    }
  }, [dashboardData, activeTab]);

  useEffect(() => {
    if (activeTab !== "thongKe") return;
    if (!dashboardData) return; // Đợi cho đến khi có dữ liệu

    const gameTypeDom = document.getElementById("gameTypeChart");
    const playerStatsDom = document.getElementById("playerStatsChart");
    if (!gameTypeDom || !playerStatsDom) return;



    // Tạo màu ngẫu nhiên cho từng loại game
    const categoryColors = {};
    const chartData = dashboardData?.gameDistribution || [
      { value: 35, name: "Hành động" },
      { value: 25, name: "Chiến thuật" },
      { value: 20, name: "Nhập vai" },
      { value: 15, name: "Thể thao" },
      { value: 5, name: "Giải đố" }
    ];
    
    // Gán màu ngẫu nhiên cho mỗi loại game
    chartData.forEach(item => {
      if (!categoryColors[item.name]) {
        categoryColors[item.name] = generateRandomColor();
      }
    });

    const gameTypeChart = echarts.init(gameTypeDom);

    const gameTypeOption = {
      animation: true,
      tooltip: {
        trigger: "item",
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151'
        },
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        textStyle: {
          color: '#6b7280',
          fontSize: 12
        }
      },
      series: [
        {
          type: "pie",
          radius: "70%",
          center: ["50%", "60%"],
          data: chartData.map(item => ({
            ...item,
            itemStyle: { color: categoryColors[item.name] || '#6B7280' }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
    gameTypeChart.setOption(gameTypeOption);

    const playerStatsChart = echarts.init(playerStatsDom);
    
    // Transform và sử dụng dữ liệu từ API hoặc fallback về dữ liệu mẫu
    let statsData = dashboardData?.playerStats || [
      { date: "26/06", newPlayers: 120, activePlayers: 320 },
      { date: "27/06", newPlayers: 132, activePlayers: 332 },
      { date: "28/06", newPlayers: 101, activePlayers: 301 },
      { date: "29/06", newPlayers: 134, activePlayers: 334 },
      { date: "30/06", newPlayers: 90, activePlayers: 390 },
      { date: "01/07", newPlayers: 230, activePlayers: 330 },
      { date: "02/07", newPlayers: 210, activePlayers: 320 }
    ];

    // Đảm bảo dữ liệu có đúng format
    if (Array.isArray(statsData)) {
      statsData = statsData.map(item => ({
        date: item.date || item.Date || "N/A",
        newPlayers: parseInt(item.newPlayers || item.newplayers || 0),
        activePlayers: parseInt(item.activePlayers || item.activeplayers || 0)
      }));
    }
    
    console.log('Chart stats data:', statsData);
    console.log('Dates:', statsData.map(item => item.date));
    console.log('New players:', statsData.map(item => item.newPlayers));
    console.log('Active players:', statsData.map(item => item.activePlayers));

    const playerStatsOption = {
      animation: true,
      tooltip: {
        trigger: "axis",
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151'
        },
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
      legend: {
        data: ["Người chơi mới", "Người chơi hoạt động"],
        textStyle: {
          color: '#6b7280',
          fontSize: 12
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: statsData.map(item => item.date),
          axisLabel: {
            color: '#6b7280',
            fontSize: 11
          },
          axisLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          }
        },
      ],
      yAxis: [
        {
          type: "value",
          axisLabel: {
            color: '#6b7280',
            fontSize: 11
          },
          axisLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6'
            }
          }
        },
      ],
      series: [
        {
          name: "Người chơi mới",
          type: "line",
          stack: "Total",
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#4F46E5'
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(79, 70, 229, 0.3)",
                },
                {
                  offset: 1,
                  color: "rgba(79, 70, 229, 0.05)",
                },
              ],
            },
          },
          emphasis: {
            focus: "series",
          },
          data: statsData.map(item => item.newPlayers),
        },
        {
          name: "Người chơi hoạt động",
          type: "line",
          stack: "Total",
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#10B981'
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(16, 185, 129, 0.3)",
                },
                {
                  offset: 1,
                  color: "rgba(16, 185, 129, 0.05)",
                },
              ],
            },
          },
          emphasis: {
            focus: "series",
          },
          data: statsData.map(item => item.activePlayers),
        },
      ],
    };
    playerStatsChart.setOption(playerStatsOption);

    const handleResize = () => {
      gameTypeChart.resize();
      playerStatsChart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gameTypeChart.dispose();
      playerStatsChart.dispose();
    };
  }, [activeTab, dashboardData]);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedGameType === "Tất cả" || game.category === selectedGameType;
    const matchesPlatform = selectedPlatform === "Tất cả" || game.platform === selectedPlatform;
    const matchesStatus = selectedStatus === "Tất cả" || game.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesPlatform && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Hành động':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Chiến thuật':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Nhập vai':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Thể thao':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Giải đố':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số game</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.overview?.totalGames || games.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Game hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview?.activeGames || games.filter(g => g.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-xl">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Loại game</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview?.uniqueCategories || new Set(games.map(g => g.category).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Người chơi</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.overview?.totalPlayers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ loại game</h3>
          <div id="gameTypeChart" className="w-full h-80"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê người chơi</h3>
          <div id="playerStatsChart" className="w-full h-80"></div>
        </div>
      </div>
    </div>
  );

  const renderGameList = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo tên game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại game</label>
            <select
              value={selectedGameType}
              onChange={(e) => setSelectedGameType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="Tất cả">Tất cả</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nền tảng</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="Tất cả">Tất cả</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.name}>{platform.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="Tất cả">Tất cả</option>
              {statuses.map(status => (
                <option key={status.id} value={status.name}>{status.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Thêm game mới
            </button>
          </div>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nền tảng</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredGames.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={game.imageUrl || 'https://via.placeholder.com/48x48/4F46E5/FFFFFF?text=G'}
                        alt={game.name}
                        className="w-12 h-12 rounded-xl object-cover mr-4"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48x48/4F46E5/FFFFFF?text=' + game.name.charAt(0);
                        }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{game.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{game.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(game.category)}`}>
                      {game.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{game.platform}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(game.status)}`}>
                      {getStatusText(game.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(game)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">Không có game nào</p>
          </div>
        )}
      </div>
    </div>
  );

  const handleEditClick = (game) => {
    setEditForm({
      id: game.id,
      name: game.name || '',
      description: game.description || '',
      category: game.category || '',
      platform: game.platform || '',
      status: game.status || '',
      imageUrl: game.imageUrl || '',
      websiteUrl: game.websiteUrl || '',
      requirements: game.requirements || '',
      hasRoles: game.hasRoles || false,
      availableRoles: game.availableRoles || '',
      availableRanks: game.availableRanks || '',
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditGame = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/games/${editForm.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      fetchGames();
    } catch (err) {
      alert('Có lỗi khi cập nhật game!');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteGame = async (game) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa game "${game.name}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/games/${game.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGames();
    } catch (err) {
      alert('Có lỗi khi xóa game!');
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      
      // Chuẩn bị dữ liệu để gửi
      const gameData = {
        ...addForm,
        // Chuyển đổi string thành array cho roles và ranks
        availableRoles: addForm.availableRoles ? addForm.availableRoles.split(',').map(role => role.trim()) : [],
        availableRanks: addForm.availableRanks ? addForm.availableRanks.split(',').map(rank => rank.trim()) : [],
      };
      
      console.log('Adding game with data:', gameData);
      const response = await axiosInstance.post('/games', gameData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Add game response:', response.data);
      setShowAddModal(false);
      setAddForm({
        name: '',
        description: '',
        category: '',
        platform: '',
        status: '',
        imageUrl: '',
        websiteUrl: '',
        requirements: '',
        hasRoles: false,
        availableRoles: '',
        availableRanks: '',
      });
      fetchGames();
    } catch (err) {
      console.error('Error adding game:', err);
      console.error('Error response:', err.response?.data);
      alert('Có lỗi khi thêm game!');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumb="Quản lý game">
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
    <AdminLayout breadcrumb="Quản lý game">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quản lý game</h1>
              <p className="text-green-100 text-lg">
                Quản lý danh sách game và thống kê người chơi
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="flex space-x-2">
            <button
              className={`px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 ${
                activeTab === "danhSach"
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab("danhSach")}
            >
              Danh sách game
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 ${
                activeTab === "thongKe"
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab("thongKe")}
            >
              Thống kê
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "danhSach" ? renderGameList() : renderDashboard()}

        {/* Edit Modal */}
        {showEditModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-center text-gray-900">Chỉnh sửa game</h3>
              </div>
              <form onSubmit={handleEditGame} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Tên game *</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Loại game</label>
                    <select
                      name="category"
                      value={editForm.category}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    >
                      <option value="">Chọn loại game</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Mô tả</label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Nền tảng</label>
                    <select
                      name="platform"
                      value={editForm.platform}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    >
                      <option value="">Chọn nền tảng</option>
                      {platforms.map((plat) => (
                        <option key={plat.id} value={plat.name}>{plat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Trạng thái</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    >
                      <option value="">Chọn trạng thái</option>
                      {statuses.map((st) => (
                        <option key={st.id} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" onClick={() => setShowEditModal(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-xl transition">Hủy</button>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition" disabled={isEditing}>
                    {isEditing ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Thêm game mới</h3>
              </div>
              <form onSubmit={handleAddGame} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên game *</label>
                    <input
                      type="text"
                      name="name"
                      value={addForm.name}
                      onChange={handleAddInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại game</label>
                    <select
                      name="category"
                      value={addForm.category}
                      onChange={handleAddInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="">Chọn loại game</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    name="description"
                    value={addForm.description}
                    onChange={handleAddInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nền tảng</label>
                                          <select
                        name="platform"
                        value={addForm.platform}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="">Chọn nền tảng</option>
                        {platforms.map((platform) => (
                          <option key={platform.id} value={platform.name}>
                            {platform.name}
                          </option>
                        ))}
                      </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                          <select
                        name="status"
                        value={addForm.status}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="">Chọn trạng thái</option>
                        {statuses.map((status) => (
                          <option key={status.id} value={status.name}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh (optional)</label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={addForm.imageUrl}
                      onChange={handleAddInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL website (optional)</label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={addForm.websiteUrl}
                      onChange={handleAddInputChange}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu hệ thống (optional)</label>
                  <textarea
                    name="requirements"
                    value={addForm.requirements}
                    onChange={handleAddInputChange}
                    rows={2}
                    placeholder="Ví dụ: Windows 10, RAM 8GB, GPU GTX 1060..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    name="hasRoles"
                    checked={addForm.hasRoles}
                    onChange={handleAddInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Game có vai trò (roles)</label>
                </div>
                {addForm.hasRoles && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vai Trò</label>
                      <input
                        type="text"
                        name="availableRoles"
                        value={addForm.availableRoles}
                        onChange={handleAddInputChange}
                        placeholder="Tank, Support, DPS, Healer"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
                      <input
                        type="text"
                        name="availableRanks"
                        value={addForm.availableRanks}
                        onChange={handleAddInputChange}
                        placeholder="Bronze, Silver, Gold, Platinum"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isAdding ? 'Đang thêm...' : 'Thêm game'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GameListPage;
