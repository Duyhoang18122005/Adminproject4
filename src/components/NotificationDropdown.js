import React, { useState, useEffect, useRef } from 'react';
import { getAdminNotifications, getNotificationStats, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../api/CallApiNotification';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ unread: 0, total: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications and stats
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        getAdminNotifications(),
        getNotificationStats()
      ]);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setStats(prev => ({ 
        ...prev, 
        total: prev.total - 1,
        unread: notifications.find(n => n.id === notificationId)?.isRead ? prev.unread : Math.max(0, prev.unread - 1)
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TOPUP':
        return 'fas fa-arrow-up text-green-600';
      case 'WITHDRAW':
        return 'fas fa-arrow-down text-red-600';
      case 'REPORT':
        return 'fas fa-exclamation-triangle text-orange-600';
      case 'VNPAY':
        return 'fas fa-credit-card text-blue-600';
      case 'DONATE':
        return 'fas fa-gift text-purple-600';
      default:
        return 'fas fa-bell text-gray-600';
    }
  };

  // Get notification title based on type
  const getNotificationTitle = (type) => {
    switch (type) {
      case 'TOPUP':
        return 'Nạp tiền';
      case 'WITHDRAW':
        return 'Rút tiền';
      case 'REPORT':
        return 'Báo cáo vi phạm';
      case 'VNPAY':
        return 'Thanh toán VNPay';
      case 'DONATE':
        return 'Quyên góp';
      default:
        return 'Thông báo';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <i className="fas fa-bell text-lg text-gray-600 dark:text-gray-300"></i>
        
        {/* Badge */}
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Thông báo
              </h3>
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats.unread} thông báo chưa đọc
            </p>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <i className="fas fa-bell-slash text-2xl text-gray-400 mb-2"></i>
                <p className="text-sm text-gray-500">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <i className={`${getNotificationIcon(notification.type)} text-sm`}></i>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {getNotificationTitle(notification.type)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                              {notification.message || notification.content}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Đánh dấu đã đọc"
                              >
                                <i className="fas fa-check text-xs"></i>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Xóa thông báo"
                            >
                              <i className="fas fa-times text-xs"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 