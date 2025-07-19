// src/components/GameCategories.js
import React, { useEffect, useState } from 'react';
import { fetchGames } from '../api/gameService';

const GameCategories = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchGames();
      setGames(data);
    };
    load();
  }, []);

  return (
      <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <i className="fas fa-gamepad text-purple-400 mr-2"></i>
        Danh Mục Game
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-700 transition-all group cursor-pointer"
          >
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <img src={game.imageUrl} alt={game.name} className="w-full h-48 object-cover" />
            </div>
            <h3 className="font-medium mb-1">{game.name}</h3>
            
          </div>
        ))}
      </div>
    </section>
  );
};

export default GameCategories;
