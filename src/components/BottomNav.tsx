import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Music, Calendar, Briefcase, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { icon: Home, label: 'Accueil', path: '/' },
  { icon: Music, label: 'Chansons', path: '/songs' },
  { icon: Calendar, label: 'Événements', path: '/events' },
  { icon: Briefcase, label: 'Projets', path: '/projects' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-white/10 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-primary" : "text-white/50"
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
