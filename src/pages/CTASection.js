import React from 'react';

function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-gray-700 to-blue-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Sẵn sàng trải nghiệm cùng PlayerDuo?
        </h2>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Đăng ký ngay hôm nay để kết nối với cộng đồng game thủ tài năng hoặc bắt đầu kiếm tiền từ đam mê chơi game của bạn
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-purple-700 px-6 py-3 rounded-full font-medium hover:bg-white/90 transition whitespace-nowrap">
            Đăng ký ngay
          </button>
          <button className="bg-transparent text-white border border-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition whitespace-nowrap">
            Tìm hiểu thêm
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
