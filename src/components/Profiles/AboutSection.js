import React from "react";

function AboutSection({ gamer }) {
  const user = gamer?.user;
  const game = gamer?.game;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border-t border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-purple-600">Giới Thiệu</h2>
      <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
        {gamer.description || "Chưa có mô tả."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        {user?.fullName && (
          <p>
            <strong>Họ tên:</strong> {user.fullName}
          </p>
        )}
        {user?.email && (
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        )}
        {user?.phoneNumber && (
          <p>
            <strong>SĐT:</strong> {user.phoneNumber}
          </p>
        )}
        {user?.gender && (
          <p>
            <strong>Giới tính:</strong> {user.gender === "MALE" ? "Nam" : "Nữ"}
          </p>
        )}
        {gamer?.server && (
          <p>
            <strong>Server:</strong> {gamer.server}
          </p>
        )}
        {gamer?.rank && (
          <p>
            <strong>Rank:</strong> {gamer.rank}
          </p>
        )}
        {gamer?.role && (
          <p>
            <strong>Vai trò:</strong> {gamer.role}
          </p>
        )}
        {game?.name && (
          <p>
            <strong>Game:</strong> {game.name}
          </p>
        )}
        {game?.platform && (
          <p>
            <strong>Nền tảng:</strong> {game.platform}
          </p>
        )}
      </div>
    </div>
  );
}

export default AboutSection;
