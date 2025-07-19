import React from 'react';

const ReviewsSection = ({ reviews }) => {
  return (
    <div className="w-full p-6 border-l border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Đánh Giá từ Người Dùng</h2>
          <div className="flex items-center">
            <div className="text-yellow-400 flex mr-1">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
            <span className="text-gray-700 font-medium">4.9</span>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start">
                <img 
                  src={review.avatar} 
                  alt={review.name} 
                  className="w-10 h-10 rounded-full object-cover mr-4"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-gray-800">{review.name}</h3>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`${i < review.rating ? 'fas' : 'far'} fa-star text-sm`}></i>
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">
            Xem thêm đánh giá <i className="fas fa-chevron-down ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;