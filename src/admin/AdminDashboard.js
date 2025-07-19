import * as echarts from 'echarts';
import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { fetchOrderStats } from '../api/CallApidashboard';
import AdminLayout from "./AdminLayout";
import { getAvatarUrl } from '../utils/imageUtils';
import { generateRandomColor } from '../utils/chartUtils';

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7days');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [userCount, setUserCount] = useState(null);
  const [userGrowth, setUserGrowth] = useState(null);
  const [orderCount, setOrderCount] = useState(null);
  const [orderGrowth, setOrderGrowth] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [revenueGrowth, setRevenueGrowth] = useState(null);
  const [reportSummary, setReportSummary] = useState({ total: null, unprocessed: null });
  const [chartData, setChartData] = useState({
    dates: ['20/06', '21/06', '22/06', '23/06', '24/06', '25/06', '26/06'],
    revenue: [5200000, 4800000, 6500000, 7200000, 6800000, 7500000, 8200000],
    orders: [120, 132, 145, 160, 152, 168, 180]
  });


  const [userDistribution, setUserDistribution] = useState({
    data: [
      { name: 'Người dùng thường', value: 1548, color: generateRandomColor() },
      { name: 'Game thủ', value: 735, color: generateRandomColor() },
      { name: 'Người dùng mới', value: 580, color: generateRandomColor() },
      { name: 'Admin', value: 120, color: generateRandomColor() }
    ],
    total: 2983
  });
  const [chartLoading, setChartLoading] = useState(true);
  const [chartRange, setChartRange] = useState('7days');
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [joinedFrom, setJoinedFrom] = useState('');
  const [joinedTo, setJoinedTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const usersPerPage = 10;

  // Initialize charts with proper error handling
  useEffect(() => {
    const initCharts = () => {
      try {
        const revenueChartElement = document.getElementById('revenue-chart');
        const userChartElement = document.getElementById('user-chart');
        
        if (!revenueChartElement || !userChartElement) {
          console.warn('Chart elements not found, will retry...');
          return false;
        }

        // Check if elements have dimensions
        if (revenueChartElement.offsetWidth === 0 || userChartElement.offsetWidth === 0) {
          console.warn('Chart elements have no dimensions, will retry...');
          return false;
        }

        // Initialize revenue chart
        const revenueChart = echarts.init(revenueChartElement);
        const revenueOption = {
          animation: true,
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: {
              color: '#374151'
            },
            formatter: function(params) {
              let result = params[0].axisValue + '<br/>';
              params.forEach(param => {
                const color = param.color;
                const value = param.seriesName === 'Doanh thu' 
                  ? new Intl.NumberFormat('vi-VN').format(param.value) + ' xu'
                  : param.value;
                result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>${param.seriesName}: ${value}<br/>`;
              });
              return result;
            }
          },
          legend: {
            data: ['Doanh thu', 'Đơn thuê'],
            textStyle: {
              color: '#6b7280',
              fontSize: 12
            },
            itemGap: 20
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: chartData.dates || ['20/06', '21/06', '22/06', '23/06', '24/06', '25/06', '26/06'],
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
          yAxis: [
            {
              type: 'value',
              name: 'Doanh thu (VNĐ)',
              axisLabel: {
                color: '#6b7280',
                fontSize: 11,
                formatter: function(value) {
                  return (value / 1000000).toFixed(0) + 'M';
                }
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
            {
              type: 'value',
              name: 'Số đơn',
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
                show: false
              }
            }
          ],
          series: [
            {
              name: 'Doanh thu',
              type: 'line',
              yAxisIndex: 0,
              data: chartData.revenue || [5200000, 4800000, 6500000, 7200000, 6800000, 7500000, 8200000],
              smooth: true,
              lineStyle: {
                width: 3,
                color: '#4F46E5'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0, color: 'rgba(79, 70, 229, 0.3)'
                  }, {
                    offset: 1, color: 'rgba(79, 70, 229, 0.05)'
                  }]
                }
              },
              itemStyle: {
                color: '#4F46E5',
                borderWidth: 2,
                borderColor: '#ffffff'
              }
            },
            {
              name: 'Đơn thuê',
              type: 'line',
              yAxisIndex: 1,
              data: chartData.orders || [120, 132, 145, 160, 152, 168, 180],
              smooth: true,
              lineStyle: {
                width: 3,
                color: '#10B981'
              },
              itemStyle: {
                color: '#10B981',
                borderWidth: 2,
                borderColor: '#ffffff'
              }
            }
          ]
        };
        revenueChart.setOption(revenueOption);

        // Initialize user chart
        const userChart = echarts.init(userChartElement);
        const userOption = {
          animation: true,
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: {
              color: '#374151'
            },
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
              color: '#6b7280',
              fontSize: 12
            },
            itemGap: 12
          },
          series: [
            {
              name: 'Phân bổ người dùng',
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['60%', '50%'],
              data: userDistribution.data || [
                { 
                  value: 1548, 
                  name: 'Người dùng thường',
                  itemStyle: { color: generateRandomColor() }
                },
                { 
                  value: 735, 
                  name: 'Game thủ',
                  itemStyle: { color: generateRandomColor() }
                },
                { 
                  value: 580, 
                  name: 'Người dùng mới',
                  itemStyle: { color: generateRandomColor() }
                },
                { 
                  value: 120, 
                  name: 'Admin',
                  itemStyle: { color: generateRandomColor() }
                }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
              },
              itemStyle: {
                borderRadius: 8,
                borderColor: '#ffffff',
                borderWidth: 3
              },
              label: {
                show: false
              },
              labelLine: {
                show: false
              }
            }
          ]
        };
        userChart.setOption(userOption);

        // Handle resize
        const handleResize = () => {
          revenueChart.resize();
          userChart.resize();
        };
        window.addEventListener('resize', handleResize);

        // Set chart loading to false
        setChartLoading(false);
        
        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          revenueChart.dispose();
          userChart.dispose();
        };
      } catch (error) {
        console.error('Error initializing charts:', error);
        setChartLoading(false);
        return false;
      }
    };

    // Try to initialize charts with retry mechanism
    let retryCount = 0;
    const maxRetries = 5;
    
    const tryInitCharts = () => {
      const cleanup = initCharts();
      if (cleanup) {
        return cleanup;
      }
      
      retryCount++;
      if (retryCount < maxRetries) {
        const timer = setTimeout(tryInitCharts, 200 * retryCount); // Exponential backoff
        return () => clearTimeout(timer);
      }
      
      console.warn('Failed to initialize charts after', maxRetries, 'attempts');
      return null;
    };

    const timer = setTimeout(tryInitCharts, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Update charts when data changes
  useEffect(() => {
    const updateCharts = () => {
      try {
        const revenueChartElement = document.getElementById('revenue-chart');
        const userChartElement = document.getElementById('user-chart');
        
        if (revenueChartElement && userChartElement) {
          const revenueChart = echarts.getInstanceByDom(revenueChartElement);
          const userChart = echarts.getInstanceByDom(userChartElement);
          
          if (revenueChart) {
            const revenueOption = revenueChart.getOption();
            revenueOption.xAxis[0].data = chartData.dates || revenueOption.xAxis[0].data;
            revenueOption.series[0].data = chartData.revenue || revenueOption.series[0].data;
            revenueOption.series[1].data = chartData.orders || revenueOption.series[1].data;
            revenueChart.setOption(revenueOption);
          }
          
          if (userChart) {
            const userOption = userChart.getOption();
            userOption.series[0].data = userDistribution.data || userOption.series[0].data;
            userChart.setOption(userOption);
          }
        }
      } catch (error) {
        console.warn('Error updating charts:', error);
      }
    };

    // Only update if charts are already initialized
    if (!chartLoading) {
      updateCharts();
    }
  }, [chartData, userDistribution, chartLoading]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch user count
        try {
          const userCountRes = await axios.get('/users/count', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserCount(userCountRes.data);
        } catch (error) {
          console.warn('Failed to fetch user count:', error);
          setUserCount(0);
        }

        // Fetch user growth
        try {
          const userGrowthRes = await axios.get('/users/growth-percent', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserGrowth(userGrowthRes.data);
        } catch (error) {
          console.warn('Failed to fetch user growth:', error);
          setUserGrowth(0);
        }

        // Fetch order stats
        const orderStats = await fetchOrderStats();
        if (orderStats) {
          setOrderCount(Number(orderStats.totalOrders));
          setRevenue(Number(orderStats.totalRevenue));
        }

        // Fetch order growth
        try {
          const orderGrowthRes = await axios.get('/orders/growth-percent-yesterday', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOrderGrowth(orderGrowthRes.data);
        } catch (error) {
          console.warn('Failed to fetch order growth:', error);
          setOrderGrowth(0);
        }



        // Fetch chart data for revenue chart
        try {
          const chartDataRes = await axios.get('/orders/chart-data?days=7', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setChartData(chartDataRes.data);
        } catch (error) {
          console.warn('Failed to fetch chart data:', error);
          setChartData({
            dates: ['20/06', '21/06', '22/06', '23/06', '24/06', '25/06', '26/06'],
            revenue: [5200000, 4800000, 6500000, 7200000, 6800000, 7500000, 8200000],
            orders: [120, 132, 145, 160, 152, 168, 180]
          });
        }

        // Fetch user distribution for pie chart
        try {
          const userDistributionRes = await axios.get('/users/distribution', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserDistribution(userDistributionRes.data);
        } catch (error) {
          console.warn('Failed to fetch user distribution:', error);
          setUserDistribution({
            data: [
              { name: 'Người dùng thường', value: 1548, color: generateRandomColor() },
              { name: 'Game thủ', value: 735, color: generateRandomColor() },
              { name: 'Người dùng mới', value: 580, color: generateRandomColor() },
              { name: 'Admin', value: 120, color: generateRandomColor() }
            ],
            total: 2983
          });
        }

        // Fetch revenue growth
        try {
          const revenueGrowthRes = await axios.get('/orders/revenue-growth-percent-yesterday', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRevenueGrowth(revenueGrowthRes.data);
        } catch (error) {
          console.warn('Failed to fetch revenue growth:', error);
          // Fallback calculation from chart data
          if (chartData.revenue && chartData.revenue.length >= 2) {
            const todayRevenue = chartData.revenue[chartData.revenue.length - 1] || 0;
            const yesterdayRevenue = chartData.revenue[chartData.revenue.length - 2] || 0;
            
            let growthPercent = 0;
            if (yesterdayRevenue > 0) {
              growthPercent = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
            } else if (todayRevenue > 0) {
              growthPercent = 100;
            }
            
            setRevenueGrowth(growthPercent);
          } else {
            setRevenueGrowth(0);
          }
        }

        // Fetch recent users (limit to 10 most recent)
        const usersRes = await axios.get('/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Process and sort users by creation date (most recent first)
        const processedUsers = usersRes.data
          .map(user => {
            // Ensure roles is always an array
            let roles = user.roles;
            if (!roles) {
              roles = [];
            } else if (typeof roles === 'string') {
              roles = [roles];
            } else if (!Array.isArray(roles)) {
              roles = [roles.toString()];
            }
            
            return {
              ...user,
              id: user.id,
              fullName: user.fullName || user.username || '',
              email: user.email,
              username: user.username,
              roles: roles,
              enabled: user.enabled,
              accountNonLocked: user.accountNonLocked,
              createdAt: user.createdAt,
              avatarUrl: user.avatarUrl
            };
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10); // Only show 10 most recent users
        
        setUsers(processedUsers);

        // Fetch report summary
        try {
          const reportRes = await axios.get('/reports/summary', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setReportSummary(reportRes.data);
        } catch (error) {
          console.warn('Failed to fetch report summary:', error);
          setReportSummary({ total: 0, unprocessed: 0 });
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values when API fails
        setUsers([]);
        setUserCount(0);
        setOrderCount(0);
        setRevenue(0);
        setReportSummary({ total: 0, unprocessed: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewUserDetail = async (userId) => {
    setIsLoadingUserDetail(true);
    setShowUserDetailModal(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/users/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Tìm user có ID tương ứng
      const userDetail = response.data.find(user => user.id === userId);
      if (userDetail) {
        setSelectedUserDetail(userDetail);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Không thể tải thông tin chi tiết người dùng');
    } finally {
      setIsLoadingUserDetail(false);
    }
  };

  const handleDeleteUser = (id) => {
    setSelectedUser(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    // Handle delete logic here
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const closeUserDetailModal = () => {
    setShowUserDetailModal(false);
    setSelectedUserDetail(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.enabled === (statusFilter === 'active');
    
    // Improved role filtering
    let matchesRole = roleFilter === 'all';
    if (roleFilter !== 'all' && user.roles) {
      const rolesStr = Array.isArray(user.roles) ? user.roles.join(',').toUpperCase() : user.roles.toString().toUpperCase();
      matchesRole = rolesStr.includes(roleFilter.toUpperCase());
    }
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getStatusColor = (enabled) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (enabled) => {
    return enabled ? 'Hoạt động' : 'Bị khóa';
  };

  const getRoleColor = (roles) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-800';
    
    // Convert to string for easier checking
    const rolesStr = Array.isArray(roles) ? roles.join(',').toUpperCase() : roles.toString().toUpperCase();
    
    if (rolesStr.includes('ADMIN') || rolesStr.includes('ROLE_ADMIN')) return 'bg-purple-100 text-purple-800';
    if (rolesStr.includes('GAMER') || rolesStr.includes('ROLE_GAMER') || rolesStr.includes('PLAYER')) return 'bg-blue-100 text-blue-800';
    if (rolesStr.includes('USER') || rolesStr.includes('ROLE_USER')) return 'bg-gray-100 text-gray-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleText = (roles) => {
    if (!roles || roles.length === 0) return 'Người dùng';
    
    // Convert to string for easier checking
    const rolesStr = Array.isArray(roles) ? roles.join(',').toUpperCase() : roles.toString().toUpperCase();
    
    if (rolesStr.includes('ADMIN') || rolesStr.includes('ROLE_ADMIN')) return 'Admin';
    if (rolesStr.includes('GAMER') || rolesStr.includes('ROLE_GAMER') || rolesStr.includes('PLAYER')) return 'Game thủ';
    if (rolesStr.includes('USER') || rolesStr.includes('ROLE_USER')) return 'Người dùng';
    
    // If we have roles but don't recognize them, show the first one
    if (Array.isArray(roles) && roles.length > 0) {
      return roles[0].replace('ROLE_', '').replace('_', ' ');
    }
    
    return 'Người dùng';
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (!users && !userCount && !orderCount) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <p className="text-gray-600 text-lg mb-2">Không thể tải dữ liệu</p>
            <p className="text-gray-400 text-sm">Vui lòng kiểm tra kết nối và thử lại</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumb="Tổng quan">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại! 👋</h1>
              <p className="text-indigo-100 text-lg">
                Đây là tổng quan về hoạt động của PlayerDuo trong ngày hôm nay
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="fas fa-chart-line text-4xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Count Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userCount?.toLocaleString('vi-VN') || 'N/A'}
                </p>
                {userGrowth !== null && (
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      userGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {userGrowth >= 0 ? '+' : ''}{userGrowth}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">so với hôm qua</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          {/* Order Count Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orderCount?.toLocaleString('vi-VN') || 'N/A'}
                </p>
                {orderGrowth !== null && (
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {orderGrowth >= 0 ? '+' : ''}{orderGrowth}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">so với hôm qua</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-shopping-cart text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">Tổng doanh thu</p>
                <p className="text-3xl font-bold text-gray-900">
                  {revenue ? new Intl.NumberFormat('vi-VN', { 
                    minimumFractionDigits: 0 
                  }).format(revenue) + ' xu' : 'N/A'}
                </p>
                {revenueGrowth !== null && (
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">so với hôm qua</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-4">
                <i className="fas fa-coins text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>

          {/* Reports Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Báo cáo vi phạm</p>
                <p className="text-3xl font-bold text-gray-900">
                  {reportSummary.total || 0}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-orange-600 font-medium">
                    {reportSummary.unprocessed || 0} chưa xử lý
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Biểu đồ doanh thu</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  7 ngày
                </button>
                <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  30 ngày
                </button>
              </div>
            </div>
            <div id="revenue-chart" className="h-80 w-full" style={{ minHeight: '320px' }}></div>
          </div>

          {/* User Distribution Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Phân bổ người dùng</h3>
            </div>
            <div id="user-chart" className="h-80 w-full" style={{ minHeight: '320px' }}></div>
          </div>
        </div>

        {/* Recent Users Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Người dùng gần đây</h3>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                Xem tất cả
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Bị khóa</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="ADMIN">Admin</option>
                <option value="GAMER">Game thủ</option>
                <option value="USER">Người dùng</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {currentUsers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-xl object-cover border-2 border-gray-100"
                            src={getAvatarUrl(user.avatarUrl, user.id)}
                            alt="avatar"
                            onError={e => { 
                              e.target.onerror = null; 
                              e.target.src = '/images/avata1.jpg'; 
                            }}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName || user.username || 'Chưa có tên'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email || 'Chưa có email'}</div>
                            <div className="text-xs text-gray-400">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.roles)}`}>
                        {getRoleText(user.roles)}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.enabled)}`}>
                          {getStatusText(user.enabled)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                            title="Xem chi tiết"
                            onClick={() => handleViewUserDetail(user.id)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users text-gray-400 text-xl"></i>
                </div>
                <p className="text-gray-500 text-lg">Không có người dùng nào</p>
                <p className="text-gray-400 text-sm mt-1">Chưa có người dùng nào được đăng ký</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {indexOfFirstUser + 1} đến {Math.min(indexOfLastUser, filteredUsers.length)} trong số {filteredUsers.length} kết quả
                </div>
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
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-2xl p-6 border-b border-gray-100 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-user text-white text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h2>
                    <p className="text-gray-600">Thông tin chi tiết và thống kê</p>
                  </div>
                </div>
                <button
                  onClick={closeUserDetailModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-8">
              {isLoadingUserDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
                </div>
              ) : selectedUserDetail ? (
                <div className="space-y-8">
                  {/* User Profile Section */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mt-4">
                    <div className="flex items-start space-x-6">
                      <div className="relative">
                        <img
                          className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                          src={getAvatarUrl(selectedUserDetail.avatarUrl, selectedUserDetail.id)}
                          alt="Avatar"
                          onError={e => { 
                            e.target.onerror = null; 
                            e.target.src = '/images/avata1.jpg'; 
                          }}
                        />
                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                          selectedUserDetail.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          <i className={`fas fa-circle text-xs ${selectedUserDetail.isOnline ? 'text-green-500' : 'text-gray-400'}`}></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {selectedUserDetail.fullName || selectedUserDetail.username || 'Chưa có tên'}
                          </h3>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(selectedUserDetail.roles)}`}>
                            {getRoleText(selectedUserDetail.roles)}
                          </span>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedUserDetail.enabled)}`}>
                            {selectedUserDetail.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p className="font-medium text-gray-900 break-all">{selectedUserDetail.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Username:</span>
                            <p className="font-medium text-gray-900">{selectedUserDetail.username}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Ngày tham gia:</span>
                            <p className="font-medium text-gray-900">
                              {selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">ID:</span>
                            <p className="font-medium text-gray-900">#{selectedUserDetail.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards - Only show for Players/Gamers */}
                  {(selectedUserDetail.roles && 
                    (Array.isArray(selectedUserDetail.roles) 
                      ? selectedUserDetail.roles.some(role => role.toUpperCase().includes('ROLE_PLAYER'))
                      : selectedUserDetail.roles.toString().toUpperCase().includes('ROLE_PLAYER')
                    )) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Tổng đơn hàng</p>
                            <p className="text-3xl font-bold text-gray-900">{selectedUserDetail.totalOrders || 0}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-shopping-cart text-blue-600 text-xl"></i>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Tổng đánh giá</p>
                            <p className="text-3xl font-bold text-gray-900">{selectedUserDetail.totalReviews || 0}</p>
                          </div>
                          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-star text-yellow-600 text-xl"></i>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Đánh giá trung bình</p>
                            <p className="text-3xl font-bold text-gray-900">
                              {selectedUserDetail.averageRating ? selectedUserDetail.averageRating.toFixed(1) : '0.0'}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-star-half-alt text-green-600 text-xl"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-user-circle text-indigo-600 mr-2"></i>
                        Thông tin cá nhân
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Họ và tên:</span>
                          <span className="font-medium text-gray-900">{selectedUserDetail.fullName || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Ngày sinh:</span>
                          <span className="font-medium text-gray-900">{selectedUserDetail.dateOfBirth || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Giới tính:</span>
                          <span className="font-medium text-gray-900">{selectedUserDetail.gender || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Số điện thoại:</span>
                          <span className="font-medium text-gray-900">{selectedUserDetail.phoneNumber || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between items-start py-2">
                          <span className="text-gray-600">Địa chỉ:</span>
                          <span className="font-medium text-gray-900 text-right max-w-xs">{selectedUserDetail.address || 'Chưa cập nhật'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-shield-alt text-purple-600 mr-2"></i>
                        Thông tin tài khoản
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Trạng thái:</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUserDetail.enabled)}`}>
                            {selectedUserDetail.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Vai trò:</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUserDetail.roles)}`}>
                            {getRoleText(selectedUserDetail.roles)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Số xu:</span>
                          <span className="font-medium text-gray-900">{selectedUserDetail.coin || 0} xu</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Trực tuyến:</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            selectedUserDetail.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedUserDetail.isOnline ? 'Có' : 'Không'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {selectedUserDetail.bio && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-quote-left text-green-600 mr-2"></i>
                        Giới thiệu
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{selectedUserDetail.bio}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                      onClick={closeUserDetailModal}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-gray-400 text-xl"></i>
                  </div>
                  <p className="text-gray-500 text-lg">Không tìm thấy thông tin người dùng</p>
                  <p className="text-gray-400 text-sm mt-1">Vui lòng thử lại sau</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
