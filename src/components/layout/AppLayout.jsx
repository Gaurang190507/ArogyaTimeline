import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { AddRecordModal } from '../records/AddRecordModal';
import { Toast } from '../common/Toast';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <TopBar />

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav />

      {/* Global Modals & Notifications */}
      <AddRecordModal />
      <Toast />
    </div>
  );
};
