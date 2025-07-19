import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import axios from "../api/axiosConfig";
import { getAvatarUrl } from "../utils/imageUtils";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', fullName: '', password: '' });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailUser, setSelectedDetailUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Available roles with descriptions
  const roleOptions = [
    {
      value: "ROLE_ADMIN",
      label: "Quản trị viên",
      description: "Toàn quyền quản lý hệ thống",
      icon: "fas fa-crown",
      color: "from-red-500 to-pink-600",
      bgColor: "bg-gradient-to-r from-red-50 to-pink-50",
      borderColor: "border-red-200"
    },
    {
      value: "ROLE_PLAYER",
      label: "Game thủ",
      description: "Người chơi game chuyên nghiệp",
      icon: "fas fa-gamepad",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
      borderColor: "border-blue-200"
    },
    {
      value: "ROLE_USER",
      label: "Người dùng",
      description: "Người dùng thông thường",
      icon: "fas fa-user",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    }
  ];

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const apiUsers = res.data.map((user) => ({
          ...user,
          id: user.id,
          name: user.fullName || user.username || "",
          email: user.email,
          role: user.roles && user.roles.length > 0 ? user.roles[0] : "USER",
          status: user.enabled && user.accountNonLocked ? "Hoạt động" : 
                  user.enabled && !user.accountNonLocked ? "Bị khóa" : "Không hoạt động",
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "",
          avatar: getAvatarUrl(user.avatarUrl, user.id),
        }));
        setUsers(apiUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    return (
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "" || user.role === roleFilter) &&
      (statusFilter === "" || user.status === statusFilter)
    );
  });

  // Sort users
  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...filteredUsers];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  // Pagination
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  // Sort handling
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Open permission modal
  const handleOpenPermissionModal = async (userId) => {
    setSelectedUser(userId);
    setShowPermissionModal(true);
    const user = users.find((u) => u.id === userId);
    setSelectedRole(user?.role || "");
  };

  // Save role
  const handleSaveRole = async () => {
    if (!selectedUser || !selectedRole) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/users/${selectedUser}/roles`, [selectedRole], {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser 
          ? { ...user, role: selectedRole }
          : user
      ));
      
      alert("Cập nhật vai trò thành công!");
      setShowPermissionModal(false);
      setSelectedUser(null);
      setSelectedRole("");
    } catch (err) {
      alert("Có lỗi khi cập nhật vai trò!");
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter(user => user.id !== userId));
      alert("Xóa người dùng thành công!");
    } catch (err) {
      alert("Có lỗi khi xóa người dùng!");
    }
  };

  // Toggle ban user
  const handleToggleBanUser = async (user) => {
    const isBanned = user.status === "Bị khóa";
    const confirmMsg = isBanned ? "Bạn có muốn mở khóa người dùng này không?" : "Bạn có muốn khóa người dùng này không?";
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const token = localStorage.getItem("token");
      const url = isBanned ? `/users/${user.id}/unlock` : `/users/${user.id}/lock`;
      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, status: isBanned ? "Hoạt động" : "Bị khóa" }
          : u
      ));
      
      alert(isBanned ? "Đã mở khóa người dùng!" : "Đã khóa người dùng!");
    } catch (err) {
      alert("Có lỗi khi thay đổi trạng thái người dùng!");
    }
  };

  // Create user
  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowCreateModal(false);
      setNewUser({ username: '', email: '', fullName: '', password: '' });
      // Refresh users list
      const res = await axios.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiUsers = res.data.map((user) => ({
        ...user,
        id: user.id,
        name: user.fullName || user.username || "",
        email: user.email,
        role: user.roles && user.roles.length > 0 ? user.roles[0] : "USER",
        status: user.enabled && user.accountNonLocked ? "Hoạt động" : 
                user.enabled && !user.accountNonLocked ? "Bị khóa" : "Không hoạt động",
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "",
        avatar: getAvatarUrl(user.avatarUrl, user.id),
      }));
      setUsers(apiUsers);
      alert("Tạo người dùng thành công!");
    } catch (err) {
      alert("Có lỗi khi tạo người dùng!");
    }
  };

  // View user detail
  const handleViewUserDetail = (user) => {
    setSelectedDetailUser(user);
    setShowDetailModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hoạt động':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: 'fas fa-check-circle' };
      case 'Bị khóa':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: 'fas fa-ban' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: 'fas fa-question-circle' };
    }
  };

  // Get role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', text: 'Admin' };
      case 'GAMER':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Game thủ' };
      case 'USER':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Người dùng' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: role };
    }
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumb="Quản lý Người dùng">
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
    <AdminLayout breadcrumb="Quản lý Người dùng">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quản lý Người dùng</h1>
              <p className="text-indigo-100 text-lg">
                Quản lý danh sách người dùng và phân quyền hệ thống
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                <i className="fas fa-users text-4xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
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
                  {users.filter(u => u.status === 'Hoạt động').length}
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
                  {users.filter(u => u.status === 'Bị khóa').length}
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
              <h2 className="text-xl font-semibold text-gray-900">Danh sách Người dùng</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
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
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Thêm Người dùng
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-4">
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tất cả vai trò</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">Người dùng</option>
                <option value="GAMER">Game thủ</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Bị khóa">Bị khóa</option>
              </select>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setRoleFilter("");
                  setStatusFilter("");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
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
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => {
                  const statusBadge = getStatusBadge(user.status);
                  const roleBadge = getRoleBadge(user.role);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-12 rounded-xl object-cover border-2 border-gray-100"
                            src={user.avatar}
                            alt={user.name}
                            onError={e => { e.target.onerror = null; e.target.src = '/images/avata1.jpg'; }}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadge.color} border`}>
                          {roleBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusBadge.color} border`}>
                          <i className={`${statusBadge.icon} mr-1`}></i>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {user.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewUserDetail(user)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => handleOpenPermissionModal(user.id)}
                            className="text-purple-600 hover:text-purple-900 transition-colors p-2 rounded-lg hover:bg-purple-50"
                            title="Phân quyền"
                          >
                            <i className="fas fa-user-shield"></i>
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
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-gray-400 text-xl"></i>
              </div>
              <p className="text-gray-500 text-lg">Không tìm thấy người dùng nào</p>
              <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {indexOfFirstUser + 1} đến {Math.min(indexOfLastUser, filteredUsers.length)} trong số {filteredUsers.length} kết quả
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
                      onClick={() => setCurrentPage(currentPage - 1)}
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
                          onClick={() => setCurrentPage(pageNumber)}
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
                      onClick={() => setCurrentPage(currentPage + 1)}
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
      {showDetailModal && selectedDetailUser && (
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
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-8">
              <div className="space-y-8">
                {/* User Profile Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mt-4">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <img
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                        src={selectedDetailUser.avatar}
                        alt={selectedDetailUser.name}
                        onError={e => { 
                          e.target.onerror = null; 
                          e.target.src = '/images/avata1.jpg'; 
                        }}
                      />
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                        selectedDetailUser.status === 'Hoạt động' ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        <i className={`fas fa-circle text-xs ${selectedDetailUser.status === 'Hoạt động' ? 'text-green-500' : 'text-gray-400'}`}></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {selectedDetailUser.name}
                        </h3>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadge(selectedDetailUser.role).color}`}>
                          {getRoleBadge(selectedDetailUser.role).text}
                        </span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(selectedDetailUser.status).color}`}>
                          {selectedDetailUser.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <p className="font-medium text-gray-900 break-all">{selectedDetailUser.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Username:</span>
                          <p className="font-medium text-gray-900">{selectedDetailUser.username || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Ngày tham gia:</span>
                          <p className="font-medium text-gray-900">{selectedDetailUser.createdAt}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">ID:</span>
                          <p className="font-medium text-gray-900">#{selectedDetailUser.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards - Only show for Players/Gamers */}
                {(selectedDetailUser.role && 
                  (selectedDetailUser.role.toUpperCase().includes('ROLE_PLAYER') || 
                   selectedDetailUser.role.toUpperCase().includes('GAMER') ||
                   selectedDetailUser.role.toUpperCase().includes('PLAYER'))) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Tổng đơn hàng</p>
                          <p className="text-3xl font-bold text-gray-900">{selectedDetailUser.totalOrders || 0}</p>
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
                          <p className="text-3xl font-bold text-gray-900">{selectedDetailUser.totalReviews || 0}</p>
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
                            {selectedDetailUser.averageRating ? selectedDetailUser.averageRating.toFixed(1) : '0.0'}
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
                        <span className="font-medium text-gray-900">{selectedDetailUser.name || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Username:</span>
                        <span className="font-medium text-gray-900">{selectedDetailUser.username || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900 break-all">{selectedDetailUser.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium text-gray-900">#{selectedDetailUser.id}</span>
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedDetailUser.status).color}`}>
                          {selectedDetailUser.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Vai trò:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(selectedDetailUser.role).color}`}>
                          {getRoleBadge(selectedDetailUser.role).text}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Ngày tham gia:</span>
                        <span className="font-medium text-gray-900">{selectedDetailUser.createdAt}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Số dư:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDetailUser.coin ? new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 0 }).format(selectedDetailUser.coin) + ' xu' : '0 xu'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-6 border-t border-gray-100">
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
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl transition-colors" 
              onClick={() => setShowCreateModal(false)}
            >
              <i className="fas fa-times"></i>
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thêm Người dùng</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  Thêm Người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showPermissionModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowPermissionModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Phân quyền người dùng</h2>
                    <p className="text-indigo-100 text-xs">Chọn vai trò phù hợp</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPermissionModal(false)}
                  className="text-white hover:text-indigo-100 transition-colors p-1 rounded-lg hover:bg-white hover:bg-opacity-20"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* User Info */}
              {selectedUser && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {users.find(u => u.id === selectedUser)?.name || 'Người dùng'}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {users.find(u => u.id === selectedUser)?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Chọn vai trò</h3>
                <div className="grid gap-3">
                  {roleOptions.map((role) => (
                    <div
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`relative cursor-pointer rounded-xl p-3 border-2 transition-all duration-200 ${
                        selectedRole === role.value
                          ? `${role.borderColor} ${role.bgColor} shadow-md scale-102`
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${role.color}`}>
                          <i className={`${role.icon} text-white`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{role.label}</h4>
                          <p className="text-xs text-gray-600">{role.description}</p>
                        </div>
                        {selectedRole === role.value && (
                          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-check text-white text-xs"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mt-0.5 text-sm"></i>
                  <div>
                    <h4 className="font-medium text-yellow-800 text-sm">Lưu ý</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      Việc thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của người dùng.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveRole}
                disabled={!selectedRole}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  selectedRole
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <i className="fas fa-save mr-1"></i>
                Lưu vai trò
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserListPage; 