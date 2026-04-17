import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Music, BookOpen, Heart, User, Settings, PlusCircle, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Drawer({ isOpen, onClose }: DrawerProps) {
  const menuItems = [
    { icon: PlusCircle, label: 'Ajouter une chanson (Offline)', path: '/add-personal-song' },
    { icon: Music, label: 'Mes chansons (Tononkirako)', path: '/personal-songs' },
    { icon: CalendarDays, label: 'Lohahevitra Alahady', path: '/sunday-themes' },
    { icon: BookOpen, label: 'Mpamaky Teny', path: '/mpamaky-teny' },
    { icon: Heart, label: 'Mes favoris', path: '/favorites' },
    { icon: User, label: 'Membres', path: '/members' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />
          
          {/* Drawer Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-bg-main z-[70] shadow-2xl border-r border-border-main"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden">
                    <img 
                      src="/logo.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="text-primary font-black text-xl">S</div>';
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-xl font-black text-text-main tracking-tighter">Shalom App</h2>
                </div>
                <button onClick={onClose} className="p-2 bg-card-main rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-card-main transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-card-main flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-5 h-5 text-text-main/60 group-hover:text-primary" />
                    </div>
                    <span className="font-medium text-text-main/80 group-hover:text-text-main">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t border-border-main">
                <p className="text-[10px] text-text-main/20 text-center uppercase tracking-widest font-bold">
                  Chorale Shalom © 2026
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
