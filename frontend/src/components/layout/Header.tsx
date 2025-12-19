"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image component
import SearchBar from '../search/SearchBar'; // Import SearchBar component

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
            <Image
              src="/images/logo.svg"
              alt="GSMHub Logo"
              width={100}
              height={40}
              priority
            />
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
        </div>

        {/* Desktop navigation and search */}
        <div className="hidden md:flex items-center space-x-4">
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
          <SearchBar />
        </div>
      </div>

      {/* Mobile menu content */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-700 mt-2 rounded-md">
          <nav>
            <ul className="flex flex-col space-y-2 p-4">
              <li>
                <Link href="/devices" className="block hover:bg-gray-600 p-2 rounded-md" onClick={toggleMobileMenu}>
                  Devices
                </Link>
              </li>
              <li>
                <Link href="/categories" className="block hover:bg-gray-600 p-2 rounded-md" onClick={toggleMobileMenu}>
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/compare" className="block hover:bg-gray-600 p-2 rounded-md" onClick={toggleMobileMenu}>
                  Compare
                </Link>
              </li>
              <li className="mt-4">
                <SearchBar />
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
