import React from "react";

function SkillsSection({ gamer }) {
  if (!gamer || !gamer.game) return null;

  const game = gamer.game;

  return (
    <div className="p-4 space-y-4 bg-white rounded-xl shadow text-gray-800">
      {/* Tabs */}
      <div className="flex space-x-6 border-b pb-2 text-sm font-medium">
        <div className="text-purple-600 border-b-2 border-purple-600 cursor-pointer">Kỹ Năng</div>
        <div className="text-gray-400 cursor-pointer">Khoảnh Khắc</div>
      </div>

      {/* Game packages */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar">
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
          🎮 {game.name || "Tên game"} - {gamer.pricePerHour}.000đ/giờ
        </div>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
          🎤 Ca Hát - 50.000đ/giờ
        </div>
        <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
          🧠 Liên Minh Tốc Chiến - 500.000đ/giờ
        </div>
      </div>

      {/* Featured Game Block */}
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex mb-3">
          <img
            src={game.imageUrl || "https://via.placeholder.com/80"}
            alt={game.name}
            className="w-20 h-20 rounded-md object-cover mr-4"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{game.name}</h3>
            <div className="text-sm text-gray-600 mb-1">
              <span>{gamer.totalGames || 5000}+ Đơn Hàng</span>
              <span className="mx-2">•</span>
              <span>Hạng A+</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs flex items-center">
                <i className="fas fa-star text-yellow-500 mr-1"></i> {(gamer.rating || 4.9).toFixed(1)}
              </span>
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">HOT</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 mt-4">
          <button
            onClick={() => console.log("Đặt đơn")}
            className="flex-1 border border-purple-500 text-purple-600 py-2 rounded-full font-medium hover:bg-purple-50"
          >
            Đặt Đơn
          </button>
          <button
            onClick={() => console.log("Mở chat")}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 flex items-center justify-center"
          >
            <i className="fas fa-comment-dots mr-2"></i> Chat
          </button>
        </div>
      </div>

      {/* Thông Tin Game */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center space-x-2 text-purple-600 font-medium">
          <i className="fas fa-info-circle"></i>
          <span>Thông Tin Game</span>
        </div>

        {/* Voice Chat / VIP Info */}
        <div className="flex items-center text-sm text-gray-600 space-x-2">
          <i className="fas fa-volume-up text-blue-500"></i>
          <span>VIP10 🎤 Mic: Hịn</span>
        </div>

        {/* Preview Game Screenshot */}
        <img
          src="https://i.imgur.com/VGM7K7Q.jpeg"
          alt="Game Preview"
          className="rounded-md w-full object-cover h-48"
        />

        {/* Roles & Notes */}
        <div className="text-sm space-y-1">
          <div>
            <strong className="text-purple-600">🎯 Hướng:</strong> Chiến Tướng
          </div>
          <div>
            <strong className="text-purple-600">📍 Vị trí:</strong>{" "}
            {gamer.role === "SUPPORT" ? "Hỗ trợ" : gamer.role}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillsSection;
