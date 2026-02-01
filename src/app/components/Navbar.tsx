import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, MessageCircle, User, Map , Handshake, HandHeart} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Browse', icon: Home, path: '/browse' },
    { label: 'Map', icon: Map, path: '/map' },
    { label: 'Resources', icon: HandHeart, path: '/resources' },
    { label: 'Saved', icon: Heart, path: '/listings' },
    { label: 'Matches', icon: Handshake, path: '/matches' },
    { label: 'Chat', icon: MessageCircle, path: '/chat' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="max-w-md mx-auto flex justify-between items-end">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 group transition-all relative"
            >
              {/* Icon with gradient when active */}
              <div className={`rounded-full p-2 transition-all ${
                isActive ? 'bg-linear-to-br from-blue-600 to-purple-500' : ''
              }`}>
                <item.icon 
                  className={`w-6 h-6 transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`} 
                />
              </div>
              
              {/* Label */}
              <span className={`text-[10px] font-medium transition-colors ${
                isActive 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};