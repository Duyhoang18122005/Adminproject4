import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPlayers } from "../../api/playerApi"; // 🔁 Import API
import { getAvatarUrl } from "../../utils/imageUtils";

function FeaturedGamers({ games, activeFilter, setActiveFilter, renderStars }) {
  const navigate = useNavigate();
  const [gamers, setGamers] = useState([]);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const data = await fetchPlayers();
        const mapped = data.map((p) => ({
          id: p.userId || p.id,
          name: p.username,
          avatar: getAvatarUrl(p.avatarUrl, `https://i.pravatar.cc/100?u=${p.username}`), // dùng avatar từ backend hoặc fallback
          game: games?.find((g) => g.id === p.gameId)?.name || "Unknown",
          rating: 4.9, // tạm mock, backend chưa có
          price: `${p.pricePerHour}.000đ`,
          orders: Math.floor(Math.random() * 200), // giả lập đơn
          online: true,
        }));
        setGamers(mapped);
      } catch (err) {
        console.error("Lỗi khi tải game thủ:", err);
      }
    };
    loadPlayers();
  }, [games]);

  const filteredGamers =
    activeFilter === "all"
      ? gamers
      : gamers.filter((g) => g.game === activeFilter);

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-7">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <i className="fas fa-star text-purple-400 mr-2"></i>
          Game Thủ Nổi Bật
        </h2>
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeFilter === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Tất cả
          </button>
          {games?.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveFilter(game.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === game.name
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredGamers.map((gamer) => (
          <div
            key={gamer.id}
            onClick={() => navigate(`/profile/${gamer.id}`)}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-purple-500/20 transition-all cursor-pointer group relative"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={gamer.avatar}
                alt={gamer.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {gamer.online && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                  ● Online
                </span>
              )}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs rounded-full shadow-md">
                  Thuê ngay
                </button>
              </div>
            </div>

            <div className="p-3 text-white text-sm space-y-1">
              <h3 className="font-semibold truncate">{gamer.name}</h3>
              <div className="text-gray-400 truncate">🎮 {gamer.game}</div>
              <div className="flex items-center text-yellow-400 text-sm">
                ⭐ {gamer.rating}
                <span className="ml-2 text-gray-300">
                  ({gamer.orders} đơn)
                </span>
              </div>
              <div className="text-yellow-400 font-bold">{gamer.price}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-medium transition-all">
          Xem thêm game thủ
          <i className="fas fa-chevron-down ml-2"></i>
        </button>
      </div>
    </section>
  );
}

export default FeaturedGamers;
