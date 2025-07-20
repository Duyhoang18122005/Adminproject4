import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import AvatarImage from '../components/AvatarImage';
import { getCurrentUser } from '../api/userApi';

const AdminLayout = ({ children, breadcrumb }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };
  const toggleUserDropdown = () => setUserDropdownOpen(!userDropdownOpen);

  // Xác định route đang active để highlight sidebar
  const isActive = (path) => location.pathname === path;

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      setIsLoadingUser(true);
      const userData = await getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Fallback to localStorage data
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      setCurrentUser({
        id: userId,
        username: localStorage.getItem('username') || 'Admin',
        fullName: localStorage.getItem('name') || 'Admin',
        email: localStorage.getItem('userEmail') || 'admin@playerduo.com',
        avatarUrl: userId && token ? `http://localhost:8080/api/auth/avatar/${userId}?token=${token}` : null
      });
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      navigate('/login');
      return;
    }
    fetchCurrentUser();
  }, []);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800'
    }`}>
      {/* Header */}
      <header className={`fixed w-full z-30 backdrop-blur-lg border-b transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-900/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar} 
              className={`p-2 rounded-xl transition-all duration-200 ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-gamepad text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  PlayerDuo
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                darkMode 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}>
                Admin
              </span>
            </div>
          </div>

          {/* Center Section - Search */}
          {/* <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng, đơn hàng, game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-2.5 rounded-xl border transition-all duration-200 ${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-indigo-500 focus:bg-gray-800' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-500 focus:border-indigo-500 focus:bg-white'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
              />
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <i className="fas fa-search"></i>
              </div>
            </div>
          </div> */}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                darkMode 
                  ? 'text-yellow-400 hover:bg-gray-800 hover:text-yellow-300' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Dropdown */}
            <div className="relative user-dropdown">
              <div 
                onClick={toggleUserDropdown} 
                className={`flex items-center space-x-3 cursor-pointer p-2 rounded-xl transition-all duration-200 ${
                  darkMode 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  {isLoadingUser ? (
                    <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse border-2 border-indigo-500/50"></div>
                  ) : (
                    <AvatarImage
                      userId={currentUser?.id}
                      alt={currentUser?.fullName || currentUser?.username || 'Admin'}
                    className="w-9 h-9 rounded-xl object-cover border-2 border-indigo-500/50"
                      size={36}
                  />
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden md:block text-left">
                  <div className={`font-semibold text-sm ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {currentUser?.fullName || currentUser?.username || localStorage.getItem('username') || 'Admin'}
                  </div>
                  <div className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Quản trị viên
                  </div>
                </div>
                <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
                  userDropdownOpen ? 'rotate-180' : ''
                } ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
              </div>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl py-2 backdrop-blur-lg border transition-all duration-200 ${
                  darkMode 
                    ? 'bg-gray-800/95 border-gray-700/50' 
                    : 'bg-white/95 border-gray-200/50'
                }`}>
                  <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      {isLoadingUser ? (
                        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      ) : (
                        <AvatarImage
                          userId={currentUser?.id}
                          alt={currentUser?.fullName || currentUser?.username || 'Admin'}
                        className="w-10 h-10 rounded-xl object-cover"
                          size={40}
                      />
                      )}
                      <div>
                        <div className={`font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {currentUser?.fullName || currentUser?.username || localStorage.getItem('username') || 'Admin'}
                        </div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {currentUser?.email || localStorage.getItem('email') || 'admin@playerduo.com'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chỉ giữ lại nút Đăng xuất */}
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                        darkMode 
                          ? 'text-red-400 hover:bg-red-500/10' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <i className="fas fa-sign-out-alt w-5 text-center mr-3"></i>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-72 transition-all duration-300 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-lg border-r pt-16 ${
        darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
      }`}>
        <div className="h-full overflow-y-auto">
          <nav className="px-6 py-6">
            <div className="space-y-2">
              {/* Dashboard */}
              <Link 
                to="/admin" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive('/admin') 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                    : darkMode 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <i className="fas fa-tachometer-alt w-5 text-center mr-3"></i>
                <span>Tổng quan</span>
              </Link>

              {/* User Management Section */}
              <div className="pt-6">
                <div className={`px-4 mb-3 text-xs font-bold uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Quản lý người dùng
                </div>
                
                <Link 
                  to="/admin/users" 
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/admin/users') 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <i className="fas fa-users w-5 text-center mr-3"></i>
                  <span>Quản lý người dùng</span>
                </Link>

                <Link 
                  to="/admin/manage-gamers" 
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/admin/manage-gamers') 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <i className="fas fa-gamepad w-5 text-center mr-3"></i>
                  <span>Quản lý Game thủ</span>
                </Link>

                <Link 
                  to="/admin/games" 
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/admin/games') 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <i className="fas fa-dice w-5 text-center mr-3"></i>
                  <span>Quản lý game</span>
                </Link>

                <Link 
                  to="/admin/report" 
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/admin/report') 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <i className="fas fa-exclamation-triangle w-5 text-center mr-3"></i>
                  <span>Quản lý vi phạm</span>
                </Link>
              </div>

              {/* Revenue Management Section */}
              <div className="pt-6">
                <div className={`px-4 mb-3 text-xs font-bold uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Quản lý doanh thu
                </div>

                <Link 
                  to="/admin/orders" 
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/admin/orders') 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <i className="fas fa-receipt w-5 text-center mr-3"></i>
                  <span>Quản lý đơn hàng</span>
                </Link>

                <Link 
                  to="/admin/revenue" 
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/admin/revenue') 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <i className="fas fa-chart-line w-5 text-center mr-3"></i>
                  <span>Quản lý doanh thu</span>
                </Link>

                <Link 
                  to="/admin/manage-payment" 
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/admin/manage-payment') 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <i className="fas fa-coins w-5 text-center mr-3"></i>
                  <span>Nạp tiền & Rút tiền</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-20 transition-all duration-300 min-h-screen ${
        sidebarOpen ? 'md:ml-72' : ''
      }`}>
        <div className="p-6 md:p-8">
          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <Link 
                      to="/admin" 
                      className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ${
                        darkMode 
                          ? 'text-gray-400 hover:text-white' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className="fas fa-home mr-2"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <i className={`fas fa-chevron-right text-xs mx-2 ${
                        darkMode ? 'text-gray-600' : 'text-gray-400'
                      }`}></i>
                      <span className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {breadcrumb}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          )}
          
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;