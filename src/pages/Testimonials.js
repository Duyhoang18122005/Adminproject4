import React from "react";

function Testimonials() {
  const testimonials = [
    {
      content:
        "Tôi đã tìm được những người chơi tuyệt vời trên PlayerDuo. Họ không chỉ giúp tôi cải thiện kỹ năng mà còn trở thành những người bạn thực sự.",
      name: "Nguyễn Văn Hùng",
      location: "Hà Nội",
      image:
        "https://readdy.ai/api/search-image?query=young%20vietnamese%20male%20face%20portrait&width=60&height=60&seq=16",
    },
    {
      content:
        "Là một game thủ nữ, tôi rất thích cách PlayerDuo tạo ra một môi trường an toàn và thân thiện.",
      name: "Trần Thị Mai",
      location: "TP.HCM",
      image:
        "https://readdy.ai/api/search-image?query=young%20vietnamese%20female%20face%20portrait&width=60&height=60&seq=17",
    },
  ];

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Người dùng nói gì về chúng tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-gray-800 p-6 rounded-lg shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
              style={{ animation: "fadeIn 0.5s ease forwards", animationDelay: `${i * 0.2}s` }}
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">"{t.content}"</p>
              <div className="flex items-center">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 mr-3"
                />
                <div>
                  <h4 className="font-medium text-white">{t.name}</h4>
                  <p className="text-sm text-gray-400">Người dùng từ {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
