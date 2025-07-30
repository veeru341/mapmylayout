import React from 'react';
import { SignOutIcon } from './icons/SignOutIcon';

interface HeaderProps {
  email: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ email, onLogout }) => {
  return (
    <header className="bg-gray-900 text-white p-3 px-6 flex justify-between items-center border-b border-gray-700 shadow-md flex-shrink-0">
      <div className="flex items-center">
         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#paint0_linear_header)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="url(#paint1_linear_header)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="url(#paint2_linear_header)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
                <linearGradient id="paint0_linear_header" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
                <linearGradient id="paint1_linear_header" x1="12" y1="17" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
                 <linearGradient id="paint2_linear_header" x1="12" y1="12" x2="12" y2="17" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
            </defs>
          </svg>
        <h1 className="text-xl font-bold">Layout Navigator</h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-300 hidden sm:inline">{email}</span>
        <button 
          onClick={onLogout} 
          title="Sign Out" 
          className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
        >
          <SignOutIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;