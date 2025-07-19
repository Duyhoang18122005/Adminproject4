import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../../utils/imageUtils";

function Header({ isLoggedIn, username, avatarUrl, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimeout = useRef(null);
  const animationDuration = 200; // ms

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeDropdownWithDelay();
      }
    };

    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        closeDropdownWithDelay();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  const openDropdown = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setIsVisible(true);
    setDropdownOpen(true);
  };

  const closeDropdownWithDelay = () => {
    setDropdownOpen(false);
    closeTimeout.current = setTimeout(() => {
      setIsVisible(false);
      closeTimeout.current = null;
    }, animationDuration);
  };

  const handleMouseEnter = () => {
    openDropdown();
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      closeDropdownWithDelay();
    }, 300);
  };

  const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=random";

  return (
    <header className="bg-gray-800 shadow-lg relative z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">
          <span className="text-purple-400">Player</span>Duo
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-white">
          <Link to="/">Trang chủ</Link>
          <Link to="#">Game</Link>
          <Link to="#">Streamer</Link>
          <Link to="#">Nạp tiền</Link>
        </nav>

         <div className="hidden md:block w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm game thủ, streamer..."
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

        <div
          className="relative"
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full font-medium hover:from-purple-700 hover:to-blue-600"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="ml-2 text-white hover:text-purple-400"
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <>
              <button
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 focus:outline-none"
                type="button"
              >
                <img
                  src={getAvatarUrl(avatarUrl, defaultAvatar)}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </button>

              {isVisible && (
                <div
                  className={`absolute right-0 mt-2 w-64 bg-gray-900 text-gray-200 rounded-lg shadow-xl overflow-hidden z-50
                    origin-top-right transform transition-all duration-200 ease-out
                    ${
                      dropdownOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                    }
                  `}
                  role="menu"
                >
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center">
                      <img
                        src={getAvatarUrl(avatarUrl, defaultAvatar)}
                        className="w-10 h-10 rounded-full mr-3  border-2 border-purple-500"
                        alt="avatar"
                      />
                      <div>
                        <div className="font-bold text-white">{username}</div>
                        <div className="text-xs text-gray-400">ID: 27025960</div>
                      </div>
                    </div>
                  </div>
                  <ul className="text-sm">
                    <li>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-purple-700 hover:text-white flex items-center"
                        role="menuitem"
                        onClick={() => closeDropdownWithDelay()}
                      >
                        <i className="fas fa-user mr-2"></i> Trung Tâm Cá Nhân
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/wallet"
                        className="block px-4 py-2 hover:bg-purple-700 hover:text-white flex items-center"
                        role="menuitem"
                        onClick={() => closeDropdownWithDelay()}
                      >
                        <i className="fas fa-wallet mr-2"></i> Ví
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/orders"
                        className="block px-4 py-2  hover:bg-purple-700 hover:text-white flex items-center"
                        role="menuitem"
                        onClick={() => closeDropdownWithDelay()}
                      >
                        <i className="fas fa-receipt mr-2"></i> Đặt Đơn
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/language"
                        className="block px-4 py-2 hover:bg-purple-700 hover:text-white flex items-center"
                        role="menuitem"
                        onClick={() => closeDropdownWithDelay()}
                      >
                        <i className="fas fa-language mr-2"></i> Ngôn Ngữ
                      </Link>
                    </li>
                    <li
                      className="px-4 py-2  cursor-pointer text-red-400 hover:bg-red-700 hover:text-red-100 flex items-center"
                      role="menuitem"
                      onClick={() => {
                        onLogout();
                        closeDropdownWithDelay();
                      }}
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i> Đăng Xuất
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
