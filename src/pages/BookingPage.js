import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../utils/imageUtils";

import { featuredGamers } from "../data/MockData";
function BookingPage() {
  const { gamerId } = useParams();
  const navigate = useNavigate(); // ✅ đặt ở đầu thân component
  const gamer = featuredGamers.find((g) => g.id === parseInt(gamerId));

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [hoursToPlay, setHoursToPlay] = useState(1);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const availableTimeSlots = [
    "09:00 - 10:00", "10:00 - 11:00", "13:00 - 14:00",
    "14:00 - 15:00", "15:00 - 16:00", "19:00 - 20:00",
    "20:00 - 21:00", "21:00 - 22:00",
  ];

   const totalCost = gamer?.price * hoursToPlay;

  const handleBooking = () => {
    const bookingInfo = {
      bookingId: `PD${new Date().getFullYear()}${String(Math.random()).slice(2, 8)}`,
      gamer: {
        name: gamer.name,
        avatar: gamer.avatar,
        game: gamer.game,
        contact: {
          phone: "0912.345.678",
          discord: "StreamQueen#1234",
          facebook: "fb.com/streamqueen",
        },
      },
      date: selectedDate.toLocaleDateString("vi-VN"),
      timeSlot: selectedTimeSlot,
      hoursBooked: hoursToPlay,
      totalCost: totalCost,
      paymentMethod:
        paymentMethod === "wallet"
          ? "Ví điện tử (MoMo)"
          : paymentMethod === "bank"
          ? "Thẻ ngân hàng"
          : paymentMethod === "credit"
          ? "Thẻ tín dụng"
          : "Tiền mặt",
    };

    navigate("/booking/success", { state: bookingInfo }); // ✅ điều hướng kèm dữ liệu
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400" />);
      } else {
        stars.push(<i key={i} className="far fa-star text-yellow-400" />);
      }
    }
    return stars;
  };

  const generateCalendar = () => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) =>
    date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
    });

  const isSameDate = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const calendarDates = generateCalendar();

  if (!gamer) return <div className="text-black p-4">Không tìm thấy game thủ.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="/" className="text-white hover:text-purple-400 flex items-center">
              <i className="fas fa-arrow-left mr-2"></i> Quay lại
            </a>
            <h1 className="text-xl font-bold text-center">Đặt Lịch Chơi Game</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Thông tin gamer */}
          <section className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center">
              <img
                src={getAvatarUrl(gamer.avatar)}
                alt={gamer.name}
                className="w-40 h-40 rounded-xl object-cover border-2 border-purple-500 mb-4 md:mb-0"
              />
              <div className="md:ml-6 flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">{gamer.name}</h2>
                <div className="text-gray-400 mb-2">
                  <i className="fas fa-gamepad mr-2" /> {gamer.game}
                </div>
                <div className="flex justify-center md:justify-start mb-2">
                  {renderStars(gamer.rating)} <span className="ml-2">({gamer.rating})</span>
                </div>
                <div className="text-xl font-bold text-purple-400">
                  {formatCurrency(gamer.price)} <span className="text-sm text-gray-400">/giờ</span>
                </div>
              </div>
            </div>
          </section>

          {/* Lịch & giờ */}
          <section className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              <i className="fas fa-calendar-alt text-purple-400 mr-2"></i> Chọn Ngày & Giờ
            </h3>

            <div className="flex overflow-x-auto space-x-2 pb-4 mb-6">
              {calendarDates.map((date, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSameDate(date, selectedDate)
                      ? "bg-gradient-to-br from-purple-600 to-blue-500 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                >
                  <div className="text-xs mb-1">{formatDate(date).split(",")[0]}</div>
                  <div className="text-xl font-bold">{date.getDate()}</div>
                  <div className="text-xs">{formatDate(date).split("/")[1]}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {availableTimeSlots.map((slot, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`py-3 px-4 rounded-xl text-center cursor-pointer transition-all ${
                    selectedTimeSlot === slot
                      ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                >
                  {slot}
                </div>
              ))}
            </div>

            {/* Số giờ */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-1 block">Số giờ chơi:</label>
              <select
                value={hoursToPlay}
                onChange={(e) => setHoursToPlay(parseInt(e.target.value))}
                className="w-full bg-gray-700 text-white p-3 rounded-xl focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((h) => (
                  <option key={h} value={h}>
                    {h} giờ - {formatCurrency(gamer.price * h)}
                  </option>
                ))}
              </select>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Ghi chú:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập yêu cầu đặc biệt..."
                className="w-full bg-gray-700 text-white p-3 rounded-xl resize-none h-24 focus:outline-none"
              />
            </div>
          </section>

         /* Payment Section */
          <section className="bg-gray-800 rounded-xl overflow-hidden mb-8 shadow-lg">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <i className="fas fa-credit-card text-purple-400 mr-2"></i>
                Phương Thức Thanh Toán
              </h3>
              <div className="space-y-3 mb-6">
                <div
                  onClick={() => setPaymentMethod("wallet")}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "wallet"
                      ? "bg-gray-700 border border-purple-500"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "wallet"
                        ? "border-purple-500"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "wallet" && (
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="font-medium">Ví điện tử</div>
                    <div className="text-sm text-gray-400">
                      MoMo, ZaloPay, VNPay
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <i className="fas fa-wallet text-purple-400 text-xl"></i>
                  </div>
                </div>
                <div
                  onClick={() => setPaymentMethod("bank")}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "bank"
                      ? "bg-gray-700 border border-purple-500"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "bank"
                        ? "border-purple-500"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "bank" && (
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="font-medium">Thẻ ngân hàng</div>
                    <div className="text-sm text-gray-400">Thẻ ATM nội địa</div>
                  </div>
                  <div className="flex space-x-2">
                    <i className="fas fa-university text-blue-400 text-xl"></i>
                  </div>
                </div>
                <div
                  onClick={() => setPaymentMethod("credit")}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "credit"
                      ? "bg-gray-700 border border-purple-500"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "credit"
                        ? "border-purple-500"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "credit" && (
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="font-medium">Thẻ tín dụng</div>
                    <div className="text-sm text-gray-400">
                      Visa, Mastercard, JCB
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <i className="fab fa-cc-visa text-gray-200 text-xl"></i>
                    <i className="fab fa-cc-mastercard text-gray-200 text-xl"></i>
                  </div>
                </div>
                <div
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "cash"
                      ? "bg-gray-700 border border-purple-500"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "cash"
                        ? "border-purple-500"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "cash" && (
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="font-medium">Tiền mặt</div>
                    <div className="text-sm text-gray-400">
                      Thanh toán khi gặp mặt
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <i className="fas fa-money-bill-wave text-green-400 text-xl"></i>
                  </div>
                </div>
              </div>
              {/* Summary */}
              <div className="bg-gray-700 rounded-xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <div className="text-gray-300">Giá mỗi giờ:</div>
                  <div>{formatCurrency(gamer.price)}</div>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="text-gray-300">Số giờ:</div>
                  <div>{hoursToPlay} giờ</div>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-600 mt-2">
                  <div className="font-bold">Tổng cộng:</div>
                  <div className="font-bold text-xl text-purple-400">
                    {formatCurrency(totalCost)}
                  </div>
                </div>
              </div>
              {/* Submit Button */}
               <button
                    onClick={handleBooking}
    disabled={!selectedTimeSlot}
    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Thanh Toán {formatCurrency(totalCost)}
  </button>
              <div className="text-center mt-4 text-sm text-gray-400">
                Bằng cách nhấn nút Thanh Toán, bạn đồng ý với{" "}
                <a href="#" className="text-purple-400 hover:underline">
                  Điều khoản dịch vụ
                </a>{" "}
                của chúng tôi
              </div>
              </div>
            </section>
        </div>
      </main>
    </div>
  );
}

export default BookingPage;
