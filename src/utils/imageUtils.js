// src/utils/imageUtils.js

/**
 * Utility function to get avatar URL
 * @param {string} avatarUrl - Đường dẫn tương đối từ backend (ví dụ: "avatars/abc.jpg") hoặc URL đầy đủ
 * @param {string} userId - ID của người dùng để tạo URL cho avatar
 * @returns {string} URL đầy đủ để hiển thị ảnh
 */
export const getAvatarUrl = (avatarUrl, userId) => {
  // If avatarUrl is null or undefined, use default
  if (!avatarUrl) {
    return '/images/avata1.jpg';
  }

  // If avatarUrl is a full URL (starts with http/https), return as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // If avatarUrl is a relative path, just add the backend base URL
  return `http://localhost:8080/${avatarUrl}`;
};

/**
 * Utility function to get profile image URL
 * @param {string} profileImageUrl - Đường dẫn tương đối từ backend (ví dụ: "profile-images/abc.jpg") hoặc URL đầy đủ
 * @param {string} userId - ID của người dùng để tạo URL cho ảnh bìa
 * @returns {string} URL đầy đủ để hiển thị ảnh
 */
export const getProfileImageUrl = (profileImageUrl, userId) => {
  // If profileImageUrl is null or undefined, try to use userId to get profile image from API
  if (!profileImageUrl) {
    if (userId) {
      return `http://localhost:8080/api/auth/profile-image/${userId}`;
    }
    return '/images/banner1.jpg'; // Default profile image
  }

  // If profileImageUrl is a full URL (starts with http/https), return as is
  if (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')) {
    return profileImageUrl;
  }

  // If profileImageUrl is a relative path, try to construct the profile image API URL
  if (profileImageUrl.startsWith('profile-images/') || profileImageUrl.startsWith('images/')) {
    if (userId) {
      return `http://localhost:8080/api/auth/profile-image/${userId}`;
    }
  }

  // If we have userId, always try to get profile image from API
  if (userId) {
    return `http://localhost:8080/api/auth/profile-image/${userId}`;
  }

  // Fallback to default profile image
  return '/images/banner1.jpg';
};

/**
 * Tạo avatar placeholder từ tên người dùng
 * @param {string} name - Tên người dùng
 * @returns {string} URL avatar placeholder
 */
export const getAvatarPlaceholder = (name) => {
  const encodedName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random`;
}; 