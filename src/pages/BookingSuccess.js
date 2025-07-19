import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingInfo = location.state;

  if (!bookingInfo) {
    navigate("/");
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
       <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a
               onClick={() => navigate("/")}
              data-readdy="true"
              className="flex items-center text-white hover:text-purple-400 transition-colors cursor-pointer"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              <span>Quay lại</span>
            </a>
            <h1 className="text-xl font-bold text-center">
              Xác Nhận Đặt Lịch Thành Công
            </h1>
            <div className="w-24"></div>{" "}
            {/* Placeholder để giữ tiêu đề ở giữa */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Thông báo thành công */}
          <section className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-green-600 mb-4">
              <i className="fas fa-check text-4xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2">Đặt lịch thành công!</h2>
            <p className="text-gray-300 mb-4">
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
            </p>
            <div className="bg-gray-800 rounded-lg py-3 px-6 inline-block">
              <span className="text-gray-400 text-sm">Mã đặt lịch:</span>
              <span className="ml-2 font-bold text-purple-400">
                {bookingInfo.bookingId}
              </span>
            </div>
          </section>

          {/* Thông tin chi tiết đặt lịch */}
          <section className="bg-gray-800 rounded-xl overflow-hidden mb-8 shadow-lg border border-gray-700">
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 py-4 px-6">
              <h3 className="text-xl font-bold">Chi Tiết Đặt Lịch</h3>
            </div>

            <div className="p-6">
              {/* Thông tin game thủ */}
              <div className="flex items-center pb-4 mb-4 border-b border-gray-700">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <img
                    src={bookingInfo.gamer.avatar}
                    alt={bookingInfo.gamer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-lg">
                    {bookingInfo.gamer.name}
                  </h4>
                  <div className="flex items-center text-gray-400">
                    <i className="fas fa-gamepad mr-2"></i>
                    <span>{bookingInfo.gamer.game}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin lịch đặt */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="w-10 text-purple-400">
                    <i className="far fa-calendar-alt text-lg"></i>
                  </div>
                  <div>
                    <div className="font-medium">Ngày đặt</div>
                    <div className="text-gray-300">{bookingInfo.date}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 text-purple-400">
                    <i className="far fa-clock text-lg"></i>
                  </div>
                  <div>
                    <div className="font-medium">Khung giờ</div>
                    <div className="text-gray-300">{bookingInfo.timeSlot}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 text-purple-400">
                    <i className="fas fa-hourglass-half text-lg"></i>
                  </div>
                  <div>
                    <div className="font-medium">Số giờ chơi</div>
                    <div className="text-gray-300">
                      {bookingInfo.hoursBooked} giờ
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 text-purple-400">
                    <i className="fas fa-money-bill-wave text-lg"></i>
                  </div>
                  <div>
                    <div className="font-medium">Tổng chi phí</div>
                    <div className="text-green-400 font-bold">
                      {formatCurrency(bookingInfo.totalCost)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 text-purple-400">
                    <i className="fas fa-credit-card text-lg"></i>
                  </div>
                  <div>
                    <div className="font-medium">Phương thức thanh toán</div>
                    <div className="text-gray-300">
                      {bookingInfo.paymentMethod}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trạng thái thanh toán */}
              <div className="bg-gray-700 rounded-lg p-4 mb-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-white"></i>
                </div>
                <div>
                  <div className="font-medium">Trạng thái thanh toán</div>
                  <div className="text-green-400">Đã thanh toán thành công</div>
                </div>
              </div>
            </div>
          </section>

          {/* Hướng dẫn liên hệ */}
          <section className="bg-gray-800 rounded-xl overflow-hidden mb-8 shadow-lg border border-gray-700">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 py-4 px-6">
              <h3 className="text-xl font-bold">Hướng Dẫn Liên Hệ</h3>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-4">
                <div className="flex items-start">
                  <div className="w-10 text-blue-400">
                    <i className="fas fa-phone-alt text-lg"></i>
                  </div>
                  <div>
                    <div className="font-medium">Số điện thoại</div>
                    <div className="text-gray-300">
                      {bookingInfo.gamer.contact.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 text-blue-400">
                    <i className="fab fa-discord text-lg"></i>
                  </div>
                  <div>
                    <div className="font-medium">Discord</div>
                    <div className="text-gray-300">
                      {bookingInfo.gamer.contact.discord}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 text-blue-400">
                    <i className="fab fa-facebook text-lg"></i>
                  </div>
                  <div>
                    <div className="font-medium">Facebook</div>
                    <div className="text-gray-300">
                      {bookingInfo.gamer.contact.facebook}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-yellow-400 mr-3 mt-1">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc pl-4 text-gray-300 space-y-1">
                      <li>
                        Vui lòng liên hệ với game thủ trước ít nhất 15 phút
                        trước giờ hẹn
                      </li>
                      <li>
                        Cung cấp mã đặt lịch khi liên hệ để xác nhận danh tính
                      </li>
                      <li>
                        Nếu cần hỗ trợ, vui lòng liên hệ hotline: 1900.1234
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <a
              href="#"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-bold text-center transition-all flex items-center justify-center !rounded-button whitespace-nowrap cursor-pointer"
            >
              <i className="fas fa-history mr-2"></i>
              Xem Lịch Sử Đặt Lịch
            </a>

            <a
              href="#"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-center transition-all flex items-center justify-center !rounded-button whitespace-nowrap cursor-pointer"
            >
              <i className="fas fa-home mr-2"></i>
              Về Trang Chủ
            </a>
          </div>

          {/* Đánh giá */}
          <section className="bg-gray-800 rounded-xl overflow-hidden mb-8 shadow-lg border border-gray-700">
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Đánh Giá Trải Nghiệm</h3>
              <p className="text-gray-300 mb-4">
                Hãy cho chúng tôi biết trải nghiệm của bạn với game thủ
              </p>

              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="text-3xl text-gray-500 hover:text-yellow-400 transition-colors cursor-pointer"
                  >
                    <i className="far fa-star"></i>
                  </button>
                ))}
              </div>

              <button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3 px-6 rounded-xl font-bold transition-all !rounded-button whitespace-nowrap cursor-pointer">
                Gửi Đánh Giá
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 PlayerDuo. Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Thanh toán qua:</span>
              <i className="fab fa-cc-visa text-xl text-gray-300"></i>
              <i className="fab fa-cc-mastercard text-xl text-gray-300"></i>
              <i className="fab fa-cc-paypal text-xl text-gray-300"></i>
              <i className="fas fa-money-bill-wave text-xl text-gray-300"></i>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
  
}

export default BookingSuccess;
