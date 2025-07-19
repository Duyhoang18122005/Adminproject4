import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../utils/imageUtils';
import axios from '../api/axiosConfig';

const AvatarTest = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Raw user data:', response.data);
        
        const usersWithAvatars = response.data.map(user => ({
          ...user,
          avatarUrl: getAvatarUrl(user.avatarUrl, user.id)
        }));
        
        console.log('Users with processed avatars:', usersWithAvatars);
        setUsers(usersWithAvatars);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const testAvatarUrl = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/avatar/${userId}`);
      console.log(`Avatar API response for user ${userId}:`, response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Avatar blob:', blob);
      } else {
        console.log('Avatar API returned error status:', response.status);
      }
    } catch (err) {
      console.error(`Error testing avatar for user ${userId}:`, err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Avatar Test Component</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="border p-4 rounded">
            <div className="flex items-center space-x-4">
              <div>
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || user.username}
                  className="w-16 h-16 rounded-full object-cover border"
                  onError={(e) => {
                    console.log(`Image failed to load for user ${user.id}:`, e.target.src);
                    e.target.src = '/images/avata1.jpg';
                  }}
                  onLoad={() => {
                    console.log(`Image loaded successfully for user ${user.id}:`, user.avatarUrl);
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold">{user.fullName || user.username}</h3>
                <p className="text-sm text-gray-600">ID: {user.id}</p>
                <p className="text-sm text-gray-600">Original avatarUrl: {user.avatarUrl || 'null'}</p>
                <p className="text-sm text-gray-600">Processed avatarUrl: {user.avatarUrl}</p>
                <button
                  onClick={() => testAvatarUrl(user.id)}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Test Avatar API
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarTest; 