import { useUser } from '../contexts/UserContext';
import { useState } from 'react';

const UserMenu = () => {
  const { username, logout } = useUser();
  const [open, setOpen] = useState(false);

  if (!username) return null;

  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setOpen(!open)} className="flex items-center space-x-2">
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="w-9 h-9 rounded-full border"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1 px-4 text-gray-700 text-sm border-b">Xin chào, {username}</div>
          <ul className="py-1 text-sm text-gray-700">
            <li><a href="/orders" className="block px-4 py-2 hover:bg-gray-100">Đơn hàng</a></li>
            <li><a href="/wallet" className="block px-4 py-2 hover:bg-gray-100">Ví</a></li>
            <li><a href="/language" className="block px-4 py-2 hover:bg-gray-100">Ngôn ngữ</a></li>
          </ul>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
