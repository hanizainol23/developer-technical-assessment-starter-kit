import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Real Estate</div>
        <ul className="flex gap-6">
          <li>
            <a href="/" className="hover:text-blue-600">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-blue-600">
              About
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-blue-600">
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
