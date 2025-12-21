"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '../search/SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faChevronDown, faScaleBalanced, faMobileScreenButton, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-[#1a237e] text-white shadow-lg sticky top-0 z-[100]">
      {/* Top Bar - Optional for extra info/links */}
      <div className="bg-[#0d1440] py-1 px-4 hidden sm:block">
        <div className="container mx-auto flex justify-end text-[11px] font-medium tracking-wide space-x-6 opacity-70">
          <Link href="/news" className="hover:text-blue-300 transition-colors">NEWS</Link>
          <Link href="/reviews" className="hover:text-blue-300 transition-colors">REVIEWS</Link>
          <Link href="/contact" className="hover:text-blue-300 transition-colors">CONTACT</Link>
          <Link href="/login" className="hover:text-blue-300 transition-colors">LOGIN</Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-4 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="bg-white p-1 rounded-lg">
              <Image
                src="/images/logo.svg"
                alt="GSMHub Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block flex-grow max-w-2xl">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/devices" 
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 font-medium"
            >
              <FontAwesomeIcon icon={faMobileScreenButton} className="text-blue-300" />
              <span>Phones</span>
            </Link>
            <Link 
              href="/categories" 
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 font-medium"
            >
              <FontAwesomeIcon icon={faLayerGroup} className="text-blue-300" />
              <span>Categories</span>
            </Link>
            <Link 
              href="/brands" 
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 font-medium"
            >
              <FontAwesomeIcon icon={faMobileScreenButton} className="text-blue-300" />
              <span>Brands</span>
            </Link>
            <Link 
              href="/compare" 
              className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30 transition-all flex items-center gap-2 font-medium"
            >
              <FontAwesomeIcon icon={faScaleBalanced} />
              <span>Compare</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu} 
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-2xl"
            aria-label="Toggle Menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Mobile Search - Visible only on mobile */}
        <div className="md:hidden mt-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0d1440] border-t border-white/10 animate-in slide-in-from-top duration-300">
          <nav className="container mx-auto p-4 flex flex-col space-y-2">
            <Link 
              href="/devices" 
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
              onClick={toggleMobileMenu}
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-300">
                <FontAwesomeIcon icon={faMobileScreenButton} />
              </div>
              <span className="font-bold">Phones & Devices</span>
            </Link>
            <Link 
              href="/categories" 
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
              onClick={toggleMobileMenu}
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-300">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              <span className="font-bold">Browse Categories</span>
            </Link>
            <Link 
              href="/brands" 
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
              onClick={toggleMobileMenu}
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-300">
                <FontAwesomeIcon icon={faMobileScreenButton} />
              </div>
              <span className="font-bold">Browse Brands</span>
            </Link>
            <Link 
              href="/compare" 
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors text-blue-300"
              onClick={toggleMobileMenu}
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faScaleBalanced} />
              </div>
              <span className="font-bold">Compare Devices</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
