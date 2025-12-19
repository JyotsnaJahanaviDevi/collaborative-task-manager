import { 
  LayoutDashboard, 
  CheckSquare, 
  Bell, 
  Settings, 
  LogOut,
  Sparkles,
  Users
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CheckSquare, label: 'All Tasks', path: '/tasks' },
  { icon: Users, label: 'Teams', path: '/teams' },
  { icon: Bell, label: 'Notifications', path: '/notifications', showBadge: true },
  { icon: Settings, label: 'Profile', path: '/profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 p-6 flex flex-col z-30 shadow-xl">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pastel-mint to-pastel-lavender flex items-center justify-center shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-xs text-gray-500 font-medium">Collaborate Better</p>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-gradient-to-br from-pastel-cream/80 to-pastel-peach/40 border border-pastel-peach/30 rounded-2xl p-4 mb-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pastel-sky to-pastel-lavender flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-white">{user?.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-pastel-mint/30 text-gray-800 font-semibold border-l-4 border-pastel-mint'
                  : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-800'
              }`
            }
          >
            {() => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon size={22} strokeWidth={2.5} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.showBadge && unreadCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold min-w-[24px] text-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 mt-auto font-medium border-2 border-transparent hover:border-red-200"
      >
        <LogOut size={22} strokeWidth={2.5} />
        <span className="font-medium">Logout</span>
      </button>
    </aside>
  );
}
