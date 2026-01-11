
import React from 'react';
import { AuthSession } from '@supabase/supabase-js';
import { Button } from './Button';

interface AdminDashboardProps {
  onClose: () => void;
  onSignOut: () => void;
  session: AuthSession;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onSignOut, session }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative border-2 border-indigo-600 text-white">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 text-2xl font-bold leading-none"
          aria-label="Close Admin Dashboard"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-indigo-400" id="admin-dashboard-title">Admin Dashboard</h3>
        <p className="text-lg mb-2">Welcome, <span className="font-semibold text-green-300">{session.user?.email || 'Admin'}</span>!</p>
        <p className="text-gray-300 mb-6">This is your system terminal. Future controls will appear here.</p>

        {/* Placeholder for future admin controls */}
        <div className="bg-gray-700 p-4 rounded-md mb-6">
          <p className="text-gray-400 text-sm">Features coming soon:</p>
          <ul className="list-disc list-inside text-gray-300 ml-4 mt-2">
            <li>Ad Control Node</li>
            <li>CMS: Page Management</li>
            <li>Registry: Link Management</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSignOut} className="bg-red-600 hover:bg-red-700 active:bg-red-800">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export { AdminDashboard };
