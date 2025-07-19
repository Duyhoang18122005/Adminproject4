import React from "react";

function Footer() {
  const socialIcons = ["facebook-f", "twitter", "instagram", "youtube", "discord"];
  const quickLinks = ["Trang chủ", "Danh sách game", "Streamer", "Dịch vụ", "Blog"];
  const supportLinks = [
    "Trung tâm hỗ trợ",
    "Điều khoản dịch vụ",
    "Chính sách bảo mật",
    "Câu hỏi thường gặp",
    "Liên hệ",
  ];
  const paymentIcons = ["cc-visa", "cc-mastercard", "cc-paypal", "money-bill-wave"];
  const appStores = [
    { name: "Google Play", icon: "google-play" },
    { name: "App Store", icon: "apple" },
  ];

  return (
    <footer className="bg-gray-800 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Info */}
          <div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-4">
              <span className="text-white">Player</span>
              <span className="text-purple-400">Duo</span>
            </div>
            <p className="text-gray-400 mb-4">
              Nền tảng kết nối game thủ và streamer hàng đầu Việt Nam
            </p>
            <div className="flex space-x-4">
              {socialIcons.map((icon) => (
                <a key={icon} href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className={`fab fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Liên Kết */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên Kết</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ Trợ */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hỗ Trợ</h3>
            <ul className="space-y-2">
              {supportLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ứng Dụng */}
          <div>
            <h3 className="text-lg font-bold mb-4">Tải Ứng Dụng</h3>
            <p className="text-gray-400 mb-4">Tải ứng dụng PlayerDuo để có trải nghiệm tốt nhất</p>
            <div className="flex flex-col space-y-2">
              {appStores.map(({ name, icon }) => (
                <a
                  key={name}
                  href="#"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-all cursor-pointer"
                >
                  <i className={`fab fa-${icon} text-2xl mr-3`}></i>
                  <div>
                    <div className="text-xs">Tải về từ</div>
                    <div className="font-medium">{name}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 PlayerDuo. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">Thanh toán qua:</span>
            {paymentIcons.map((icon) => (
              <i key={icon} className={`fab fa-${icon} text-xl text-gray-300`}></i>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
