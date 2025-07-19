import React, { useState, useEffect } from 'react';
import { getAvatarDataUrl } from '../api/avatarApi';

const AvatarImage = ({ userId, alt, className, size = 36 }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Generate fallback avatar URL
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt || 'User')}&background=6366f1&color=fff&size=${size}`;

  useEffect(() => {
    const loadAvatar = async () => {
      if (!userId) {
        setImageLoading(false);
        setImageError(true);
        return;
      }

      try {
        setImageLoading(true);
        setImageError(false);
        const dataUrl = await getAvatarDataUrl(userId);
        setImageSrc(dataUrl);
      } catch (error) {
        console.error('Error loading avatar:', error);
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };

    loadAvatar();
  }, [userId]);

  // Show loading skeleton
  if (imageLoading) {
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl`}></div>
    );
  }

  // Show fallback avatar
  if (imageError || !imageSrc) {
    return (
      <img
        src={fallbackUrl}
        alt={alt || 'User'}
        className={className}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  }

  // Show actual avatar
  return (
    <img
      src={imageSrc}
      alt={alt || 'User'}
      className={className}
    />
  );
};

export default AvatarImage; 