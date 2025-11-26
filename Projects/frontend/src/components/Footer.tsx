import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-2">About</h3>
            <p className="text-sm text-gray-400">Premier real estate platform with thousands of listings.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Quick Links</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="#" className="hover:text-white">Browse</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Contact</h3>
            <p className="text-sm text-gray-400">email@example.com</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
          &copy; 2025 Real Estate. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
