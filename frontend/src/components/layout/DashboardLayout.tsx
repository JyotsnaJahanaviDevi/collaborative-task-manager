import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="md:ml-64">
        <div className="sticky top-0 z-20 flex items-center gap-3 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-800">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-pastel-mint to-pastel-lavender flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <span className="text-sm font-semibold">TaskFlow</span>
          </Link>
        </div>
        <main className="p-4 sm:p-6 md:p-8">
        {children}
        </main>
      </div>
    </div>
  );
}
