import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isDestructive?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Eny, fafao',
  cancelText = 'Aoka ihany',
  type = 'danger',
  isDestructive = false
}: ConfirmationModalProps) {
  const finalType = isDestructive ? 'danger' : type;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xs bg-[#2D2D2D] rounded-2xl p-6 shadow-2xl border border-white/5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${finalType === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button onClick={onClose} className="p-2 text-text-main/30 hover:text-text-main">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-xl font-black mb-2">{title}</h3>
            <p className="text-text-main/60 text-sm leading-relaxed mb-8">
              {message}
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`w-full py-3 rounded-xl font-bold transition-transform active:scale-95 ${
                  finalType === 'danger' ? 'bg-red-500 text-white' : 'bg-primary text-[#212121]'
                }`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-text-main/40 hover:text-text-main transition-colors"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
