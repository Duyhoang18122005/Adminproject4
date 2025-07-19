import React from 'react';

const ContactInfo = ({ gamer }) => {
  if (!gamer || !gamer.contact) return null;

  const { discord, facebook, youtube } = gamer.contact;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Thông Tin Liên Hệ</h2>
        <div className="space-y-3">
          {discord && (
            <div className="flex items-center">
              <i className="fab fa-discord text-indigo-600 w-6"></i>
              <span className="text-gray-700">{discord}</span>
            </div>
          )}
          {facebook && (
            <div className="flex items-center">
              <i className="fab fa-facebook text-blue-600 w-6"></i>
              <a href={facebook} className="text-blue-600 hover:underline cursor-pointer" target="_blank" rel="noopener noreferrer">
                {facebook.replace('https://', '').replace('http://', '')}
              </a>
            </div>
          )}
          {youtube && (
            <div className="flex items-center">
              <i className="fab fa-youtube text-red-600 w-6"></i>
              <a href={youtube} className="text-blue-600 hover:underline cursor-pointer" target="_blank" rel="noopener noreferrer">
                {youtube.replace('https://', '').replace('http://', '')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
