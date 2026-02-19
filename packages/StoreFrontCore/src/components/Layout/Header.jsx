import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import Logo from './Logo';
import logoImage from '@/assets/NovaLogo.png';

export default function Header({ sidebarOpen, onToggleSidebar, headerLinks = [] }) {
  return (
    <>
      <header className="w-full bg-teal-800 text-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Logo src={logoImage} />

            {/* Desktop Nav */}
            <NavBar className="hidden md:flex space-x-6" links={headerLinks} />

            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden text-white"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <div className="h-16" />
    </>
  );
}
