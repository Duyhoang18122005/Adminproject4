import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import axios from '../api/axiosConfig';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', form);
      const { token, username, roles, id, email } = res.data;
      login(username); // ✅ gọi hàm login
      localStorage.setItem('token', token);
      localStorage.setItem('roles', JSON.stringify(roles));
      localStorage.setItem('userId', id);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      if (
        roles &&
        roles.some(role => role.toLowerCase() === 'role_admin' || role.toLowerCase() === 'admin')
      ) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setMessage(err.response?.data || 'Đăng nhập thất bại');
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-white-400">Đăng nhập</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="username" className="sr-only">Tên đăng nhập</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Tên đăng nhập"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-200 placeholder-gray-400"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mật khẩu"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-200 placeholder-gray-400"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-300 ease-in-out"
          >
            Đăng nhập
          </button>
        </form>
        {message && (
          <p className="mt-6 text-center text-red-500 bg-red-900 bg-opacity-30 py-2 px-4 rounded-md">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;