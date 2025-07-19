import React from "react";

function BannerSlider({ slides, currentSlide, setCurrentSlide, nextSlide, prevSlide }) {
  return (
    <div className="relative h-[400px] mb-12 overflow-hidden rounded-xl">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center z-20">
                <div className="ml-12 max-w-lg">
                  <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-lg mb-6">{slide.description}</p>
                  <button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-3 rounded-full font-medium transition-all !rounded-button whitespace-nowrap cursor-pointer">
                    Đặt lịch ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all !rounded-button whitespace-nowrap cursor-pointer"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all !rounded-button whitespace-nowrap cursor-pointer"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"}`}
              ></button>
            ))}
          </div>
        </div>
  );
}

export default BannerSlider;
