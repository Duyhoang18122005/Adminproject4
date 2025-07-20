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
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

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
          role: user.roles && user.roles.length > 0 ? user.roles[0] : "ROLE_USER",
          status: user.enabled && user.accountNonLocked ? "Hoạt động" : 
                  user.enabled && !user.accountNonLocked ? "Bị khóa" : "Không hoạt động",
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "",
          avatar: getAvatarUrl(user.avatarUrl, user.id),
        }));
        
        // Debug: Log unique roles to see what we're working with
        const uniqueRoles = [...new Set(apiUsers.map(user => user.role))];
        console.log('Available roles in data:', uniqueRoles);
        
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
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    const matchesStatus = statusFilter === "" || user.status === statusFilter;
    
    // Debug: Log filtering details
    if (roleFilter && !matchesRole) {
      console.log(`User ${user.name} role "${user.role}" doesn't match filter "${roleFilter}"`);
    }
    
    return matchesSearch && matchesRole && matchesStatus;
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
      
      showNotification("Cập nhật vai trò thành công!", "success");
      setShowPermissionModal(false);
      setSelectedUser(null);
      setSelectedRole("");
    } catch (err) {
      console.error('Error updating role:', err);
      showNotification("Có lỗi khi cập nhật vai trò!", "error");
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
      showNotification("Xóa người dùng thành công!", "success");
    } catch (err) {
      console.error('Error deleting user:', err);
      showNotification("Có lỗi khi xóa người dùng!", "error");
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
      
      showNotification(isBanned ? "Đã mở khóa người dùng!" : "Đã khóa người dùng!", "success");
    } catch (err) {
      console.error('Error toggling user ban status:', err);
      showNotification("Có lỗi khi thay đổi trạng thái người dùng!", "error");
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
        role: user.roles && user.roles.length > 0 ? user.roles[0] : "ROLE_USER",
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
      case 'ROLE_ADMIN':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', text: 'Admin' };
      case 'ROLE_PLAYER':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Game thủ' };
      case 'ROLE_USER':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Người dùng' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Người dùng' };
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
                <option value="ROLE_ADMIN">Admin</option>
                <option value="ROLE_USER">Người dùng</option>
                <option value="ROLE_PLAYER">Game thủ</option>
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
        
        {/* Permission Modal */}
        {showPermissionModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Phân quyền người dùng</h3>
              <p className="text-gray-700 mb-4">
                Bạn đang phân quyền cho người dùng có ID: {selectedUser}
              </p>
              <div className="flex flex-col gap-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`flex items-center justify-between px-4 py-2 rounded-xl text-left text-gray-800 hover:bg-gray-100 transition-colors ${
                      selectedRole === role.value
                        ? 'bg-indigo-100 font-medium'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className={`${role.icon} mr-3 text-indigo-600 text-lg`}></i>
                      <span>{role.label}</span>
                    </div>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${role.color} border`}>
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  Lưu phân quyền
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Tạo người dùng mới</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="VD: john_doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="VD: john.doe@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="VD: John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Mật khẩu mặc định"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  Tạo người dùng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedDetailUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Chi tiết người dùng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Tên đăng nhập:</p>
                  <p className="text-gray-900">{selectedDetailUser.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email:</p>
                  <p className="text-gray-900">{selectedDetailUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Họ và tên:</p>
                  <p className="text-gray-900">{selectedDetailUser.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Vai trò:</p>
                  <p className="text-gray-900">{selectedDetailUser.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Trạng thái:</p>
                  <p className="text-gray-900">{selectedDetailUser.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Ngày tham gia:</p>
                  <p className="text-gray-900">{selectedDetailUser.createdAt}</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
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

export default UserListPage;