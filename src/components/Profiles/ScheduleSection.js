import React from 'react';

const ScheduleSection = ({ weekDays, timeSlots, scheduleData }) => {
  return (
    <div className="w-full p-4">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch Rảnh</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 px-3 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"></th>
                {weekDays.map((day, index) => (
                  <th key={index} className="py-2 px-3 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, timeIndex) => (
                <tr key={timeIndex} className={timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 text-sm font-medium text-gray-700">{time}</td>
                  {weekDays.map((day, dayIndex) => (
                    <td key={dayIndex} className="py-2 px-3 text-center">
                      <div 
                        className={`inline-block w-6 h-6 rounded-full ${
                          scheduleData[day][timeIndex] === 'available' 
                            ? 'bg-green-500 cursor-pointer' 
                            : 'bg-gray-300'
                        }`}
                        title={scheduleData[day][timeIndex] === 'available' ? 'Có thể đặt' : 'Đã có người đặt'}
                      ></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center mt-4 text-sm text-gray-600">
          <div className="flex items-center mr-4">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Có thể đặt</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
            <span>Đã có người đặt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;