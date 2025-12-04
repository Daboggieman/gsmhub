import React from 'react';
import Link from 'next/link';
import SearchBar from '../search/SearchBar'; // Import SearchBar component

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          GSMHub
        </Link>
        <div className="flex items-center space-x-4"> {/* Group navigation and search */}
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/devices" className="hover:text-gray-300">
                  Devices
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-gray-300">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-gray-300">
                  Compare
                </Link>
              </li>
            </ul>
          </nav>
          <SearchBar /> {/* Integrate SearchBar */}
        </div>
      </div>
    </header>
  );
};

export default Header;
