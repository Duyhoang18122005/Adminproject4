import React from "react";

function HowItWorks() {
  const steps = [
    {
      icon: "search",
      title: "Tìm Kiếm",
      description: "Tìm kiếm game thủ hoặc streamer phù hợp với nhu cầu của bạn",
      bg: "bg-purple-600",
    },
    {
      icon: "calendar-alt",
      title: "Đặt Lịch",
      description: "Chọn thời gian và đặt lịch chơi game cùng người bạn đã chọn",
      bg: "bg-blue-600",
    },
    {
      icon: "gamepad",
      title: "Trải Nghiệm",
      description: "Tận hưởng trải nghiệm chơi game tuyệt vời cùng các game thủ chuyên nghiệp",
      bg: "bg-indigo-600",
    },
  ];

  return (
    <section className="mb-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-8 text-center">Cách Thức Hoạt Động</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.icon} className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 ${step.bg} rounded-full flex items-center justify-center text-2xl`}>
              <i className={`fas fa-${step.icon}`}></i>
            </div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-gray-300">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
