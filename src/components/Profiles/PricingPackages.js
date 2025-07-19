import React from 'react';

function PricingPackages ({ selectedPackage, setSelectedPackage })  {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 sticky top-24">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Gói Dịch Vụ</h2>
        
        <div 
          className={`border rounded-xl p-4 mb-4 cursor-pointer transition-all duration-200 ${selectedPackage === 1 ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
          onClick={() => setSelectedPackage(1)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800">Gói 1 giờ</h3>
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPackage === 1 ? 'border-indigo-500' : 'border-gray-300'}`}>
                {selectedPackage === 1 && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
              </div>
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-600 mb-1">150,000đ</div>
          <p className="text-sm text-gray-600">Phù hợp cho buổi coaching ngắn hoặc chơi thử</p>
        </div>
        
        <div 
          className={`border rounded-xl p-4 mb-4 cursor-pointer transition-all duration-200 ${selectedPackage === 2 ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
          onClick={() => setSelectedPackage(2)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800">Gói 3 giờ</h3>
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPackage === 2 ? 'border-indigo-500' : 'border-gray-300'}`}>
                {selectedPackage === 2 && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
              </div>
            </div>
          </div>
          <div className="flex items-center mb-1">
            <div className="text-xl font-bold text-indigo-600 mr-2">420,000đ</div>
            <div className="text-sm line-through text-gray-500">450,000đ</div>
            <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Giảm 10%</div>
          </div>
          <p className="text-sm text-gray-600">Phù hợp cho buổi coaching chuyên sâu</p>
        </div>
        
        <div 
          className={`border rounded-xl p-4 mb-6 cursor-pointer transition-all duration-200 ${selectedPackage === 3 ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
          onClick={() => setSelectedPackage(3)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800">Gói 5 giờ</h3>
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPackage === 3 ? 'border-indigo-500' : 'border-gray-300'}`}>
                {selectedPackage === 3 && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
              </div>
            </div>
          </div>
          <div className="flex items-center mb-1">
            <div className="text-xl font-bold text-indigo-600 mr-2">650,000đ</div>
            <div className="text-sm line-through text-gray-500">750,000đ</div>
            <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Giảm 15%</div>
          </div>
          <p className="text-sm text-gray-600">Phù hợp cho khóa học toàn diện hoặc leo rank</p>
        </div>
        
        <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-base font-medium shadow-lg hover:from-indigo-700 hover:to-purple-700 transition duration-150 ease-in-out !rounded-button whitespace-nowrap cursor-pointer">
          <i className="fas fa-shopping-cart mr-2"></i> Thuê Ngay
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Đảm bảo hoàn tiền nếu không hài lòng</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPackages;