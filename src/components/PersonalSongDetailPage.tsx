import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { ChevronLeft, Share2, Type, Trash2, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmationModal } from './ConfirmationModal';

export function PersonalSongDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(16);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const song = useLiveQuery(() => db.tononkiraako.get(Number(id)), [id]);

  const handleDelete = async () => {
    if (!id) return;
    await db.tononkiraako.delete(Number(id));
    navigate('/personal-songs');
  };

  if (!song) return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-main pb-10">
      <header className="sticky top-0 bg-bg-main/80 backdrop-blur-md z-10 px-4 py-4 flex items-center justify-between border-b border-border-main">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setFontSize(s => Math.min(s + 2, 32))} className="p-2">
            <Type className="w-5 h-5" />
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="p-2">
            <Trash2 className="w-5 h-5 text-red-500/50" />
          </button>
          <button className="p-2">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold uppercase text-text-main/30 tracking-widest">Hira ako</span>
        </div>
        <h1 className="text-3xl font-black text-primary mb-2 leading-tight">{song.titre}</h1>
        <p className="text-lg text-text-main/60 mb-8 italic">{song.mpihira}</p>
        
        <div 
          className="whitespace-pre-wrap leading-relaxed font-medium"
          style={{ fontSize: `${fontSize}px` }}
        >
          {song.tonony}
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Fafana ity hira ity?"
        message="Miala tsiny indrindra, saingy azo antoka ve fa tianao hofafana tokoa ity hira ity amin'ny lisitry ny hira anao?"
      />
    </div>
  );
}
