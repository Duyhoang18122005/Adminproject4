import React, { useState, useEffect } from "react";
import Header from "../components/Layout/Header";
import BannerSlider from "../components/BannerSlider";
import GameCategories from "../components/GameCategories";
import FeaturedGamers from "../components/Playercart/FeaturedGamers";
import HowItWorks from "../components/HowItWorks";
import ChatBox from "../components/ChatBox";
import Footer from "../components/Layout/Footer";
import CTASection from "../pages/CTASection";




import { games, featuredGamers, bannerSlides } from "../data/MockData";
import SearchFilter from "../pages/SearchFilter";
import Testimonials from "../pages/Testimonials";

function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [activeGameFilter, setActiveGameFilter] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === bannerSlides.length - 1 ? 0 : prev + 1));

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      } else if (i - 0.5 <= rating) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-yellow-400"></i>);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
     
      <main className="container mx-auto px-4 py-8">
        <BannerSlider
          slides={bannerSlides}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          nextSlide={nextSlide}
          prevSlide={prevSlide}
        />
        <SearchFilter/>
        <GameCategories games={games} />
         <div className="px-6 py-10">
     
      <FeaturedGamers
  games={games}
  activeFilter={activeGameFilter}
  setActiveFilter={setActiveGameFilter}
  renderStars={renderStars}
/>

    </div>
        <HowItWorks />
        <Testimonials/>
        <CTASection/>
      </main>
      <ChatBox
        showChatBox={showChatBox}
        setShowChatBox={setShowChatBox}
        gamers={featuredGamers}
      />
      <Footer />
    </div>
  );
}

export default HomePage;
