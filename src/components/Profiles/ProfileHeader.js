import React from 'react';

function ProfileHeader({ gamer }) {
  if (!gamer) {
    return <div className="text-red-500 p-4">Không tìm thấy thông tin game thủ.</div>;
  }

  return (
    <div className="w-full p-4">
      {/* Top Info */}
      <div className="flex items-center mb-4">
        <div className="mr-3">
          <img
            src={gamer?.avatar}
            alt={gamer?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold flex items-center text-purple-700">
            {gamer.name}
            <span className="ml-1 text-blue-500">💙</span>
          </h2>
          <div className="flex items-center text-xs mt-1">
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full mr-2">
              VIP
            </span>
            {gamer.online && (
              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full">Online</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative mb-4 rounded-lg overflow-hidden">
        <img
          src={gamer.mainImage || gamer.avatar}
          alt="Profile Large"
          className="w-full h-80 object-cover object-top border-2 border-purple-600"
        />
      </div>

      {/* Slider (Static thumbnails for now) */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((index) => (
          <button
            key={index}
            className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 border-gray-200 hover:border-purple-600 transition duration-150"
          >
            <img
              src={`https://readdy.ai/api/search-image?query=beautiful%20young%20Asian%20woman%20portrait&width=64&height=64&seq=${index + 3}`}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover object-top"
            />
          </button>
        ))}
        <button className="flex-shrink-0 w-8 h-16 bg-purple-100 rounded-md flex items-center justify-center text-purple-600 hover:bg-purple-200 transition">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* Bio / Lý lịch */}
      <div className="mt-4">
        <h3 className="font-medium text-lg mb-2 text-purple-700">Lý lịch</h3>
        <p className="text-sm text-gray-700">
          {gamer.bio ||
            'Em thích chơi game và mời bạn bè cùng chơi! Tôi giỏi Liên Quân Mobile và PUBG Mobile. Hãy chơi cùng nhau 💙 💙'}
        </p>
      </div>
    </div>
  );
}

export default ProfileHeader;
