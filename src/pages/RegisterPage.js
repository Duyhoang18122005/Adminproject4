import React, { useState } from 'react';
import axios from '../api/axiosConfig';

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    gender: 'OTHER',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/register', form);
      setMessage(res.data.message || 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      // Optionally clear the form after successful registration
      setForm({
        username: '',
        password: '',
        email: '',
        fullName: '',
        dateOfBirth: '',
        phoneNumber: '',
        address: '',
        gender: 'OTHER',
      });
    } catch (err) {
      setMessage(err.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg text-white">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-white-400">Đăng ký tài khoản mới</h2>
        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Tên đăng nhập</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              onChange={handleChange}
              value={form.username}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
              required
            />
          </div>
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              onChange={handleChange}
              value={form.password}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
              required
            />
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Nhập địa chỉ email"
              onChange={handleChange}
              value={form.email}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
              required
            />
          </div>
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Họ tên</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Nhập họ và tên của bạn"
              onChange={handleChange}
              value={form.fullName}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
              required
            />
          </div>
          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-1">Ngày sinh</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              onChange={handleChange}
              value={form.dateOfBirth}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
              required
            />
          </div>
          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">Số điện thoại</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Nhập số điện thoại"
              onChange={handleChange}
              value={form.phoneNumber}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
              required
            />
          </div>
          {/* Address */}
          <div className="md:col-span-2"> {/* This input spans both columns */}
            <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Địa chỉ</label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Nhập địa chỉ của bạn"
              onChange={handleChange}
              value={form.address}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-400"
              required
            />
          </div>
          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">Giới tính</label>
            <select
              id="gender"
              name="gender"
              onChange={handleChange}
              value={form.gender}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 appearance-none pr-8"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          {/* Spacer for alignment if needed, or remove if not necessary */}
          <div className="hidden md:block"></div> 

          {/* Submit Button */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              className="w-full bg-purplepurple-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-300 ease-in-out"
            >
              Đăng ký
            </button>
          </div>
        </form>
        {message && (
          <p className={`mt-6 text-center py-2 px-4 rounded-md ${message.includes('thành công') ? 'text-green-400 bg-green-900 bg-opacity-30' : 'text-red-500 bg-red-900 bg-opacity-30'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;