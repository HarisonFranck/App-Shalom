import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { ChevronLeft, Heart, Share2, Type, Check } from 'lucide-react';
import { motion } from 'motion/react';

export function SongDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(16);
  const [showToast, setShowToast] = useState(false);

  const song = useLiveQuery(async () => {
    if (!id) return null;
    // Try both string and number ID lookups
    const s = await db.tononkira.get(id);
    if (s) return s;
    return db.tononkira.get(Number(id));
  }, [id]);

  const isFavorite = useLiveQuery(async () => {
    if (!id) return false;
    const fav = await db.tononkiratiana.where('idtononkira').equals(id).first();
    if (fav) return true;
    const favNum = await db.tononkiratiana.where('idtononkira').equals(Number(id)).first();
    return !!favNum;
  }, [id]);

  const toggleFavorite = async () => {
    if (!song) return;
    
    const existing = await db.tononkiratiana.where('idtononkira').equals(song.idtononkira).first();
    
    if (existing) {
      if (confirm('Miala tsiny indrindra, saingy azo antoka ve fa tianao hovafana tokoa ity hira ity amin\'ny lisitry ny tianao?')) {
        await db.tononkiratiana.delete(existing.id!);
      }
    } else {
      await db.tononkiratiana.add({
        titre: song.titre,
        mpihira: song.mpihira,
        tonony: song.tonony,
        idtononkira: song.idtononkira,
        created_at: new Date().toISOString()
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
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
          <button onClick={toggleFavorite} className="p-2">
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-text-main/40'}`} />
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
        <h1 className="text-3xl font-black text-primary mb-2 leading-tight">{song.titre}</h1>
        <p className="text-lg text-text-main/60 mb-8 italic">{song.mpihira}</p>
        
        <div 
          className="whitespace-pre-wrap leading-relaxed font-medium"
          style={{ fontSize: `${fontSize}px` }}
        >
          {song.tonony}
        </div>
      </motion.div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-[#212121] px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-2xl z-50">
          <Check className="w-5 h-5" />
          Ajouté aux favoris
        </div>
      )}
    </div>
  );
}
