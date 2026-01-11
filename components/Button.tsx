
import React from 'react';

interface ButtonProps {
  // Made optional to support buttons used in forms where onClick is not directly required
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  // Add 'type' property to allow specifying button type (e.g., 'submit', 'button').
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', disabled = false, type = 'button' }) => {
  return (
    <button
      onClick={onClick}
      // Pass the type prop to the native button element
      type={type}
      className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-200
        ${disabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-lg transform hover:scale-105 active:scale-95'}
        ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export { Button };
