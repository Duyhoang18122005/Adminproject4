import React, { useState } from 'react';

function SearchFilter({ onFilterChange }) {
  const [searchText, setSearchText] = useState("");
  const [gender, setGender] = useState({ male: false, female: false });
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState(3);
  const [selectedGame, setSelectedGame] = useState("all");

  const handleApplyFilter = () => {
    onFilterChange({
      searchText,
      gender,
      minPrice: parseInt(minPrice) || 0,
      maxPrice: parseInt(maxPrice) || Infinity,
      rating,
      selectedGame,
    });
  };

  return (
    <section className="py-8 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm game thủ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700 text-gray-200 border border-gray-600 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              <div className="absolute left-4 top-3.5 text-gray-400">
                <i className="fas fa-search text-xl"></i>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Chọn game */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chọn game</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="all">Tất cả game</option>
                <option value="PUBG">PUBG</option>
                <option value="Liên Quân">Liên Quân</option>
                <option value="LMHT">LMHT</option>
                <option value="Valorant">Valorant</option>
                <option value="CS:GO">CS:GO</option>
              </select>
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Giới tính</label>
              <div className="flex space-x-4 text-gray-300">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 accent-purple-500"
                    checked={gender.male}
                    onChange={() => setGender({ ...gender, male: !gender.male })}
                  />
                  Nam
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 accent-pink-500"
                    checked={gender.female}
                    onChange={() => setGender({ ...gender, female: !gender.female })}
                  />
                  Nữ
                </label>
              </div>
            </div>

            {/* Khoảng giá */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Khoảng giá (VNĐ/giờ)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Đánh giá */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Đánh giá tối thiểu</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
                <span className="ml-3 text-gray-300 font-medium">{rating} ★</span>
              </div>
            </div>
          </div>

          {/* Nút áp dụng */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleApplyFilter}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-2.5 rounded-full font-semibold transition"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchFilter;
