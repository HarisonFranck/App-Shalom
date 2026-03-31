import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/src/lib/db';
import { ChevronLeft, Save, Clipboard, Music } from 'lucide-react';
import { motion } from 'motion/react';

export function AddPersonalSong() {
  const navigate = useNavigate();
  const [titre, setTitre] = useState('');
  const [mpihira, setMpihira] = useState('');
  const [tonony, setTonony] = useState('');

  const [showPasteError, setShowPasteError] = useState(false);
  const isPasteEnabled = localStorage.getItem('paste_enabled') === 'true';

  const handlePaste = async () => {
    try {
      // On demande explicitement la permission si possible
      if (navigator.permissions && (navigator.permissions as any).query) {
        const result = await (navigator.permissions as any).query({ name: 'clipboard-read' });
        if (result.state === 'denied') {
          setShowPasteError(true);
          setTimeout(() => setShowPasteError(false), 3000);
          return;
        }
      }

      const text = await navigator.clipboard.readText();
      if (text) {
        setTonony(prev => prev + (prev ? '\n' : '') + text);
      }
    } catch (err) {
      console.warn('Clipboard access restricted:', err);
      setShowPasteError(true);
      setTimeout(() => setShowPasteError(false), 3000);
    }
  };

  const handleSave = async () => {
    if (!titre || !tonony) return;
    
    await db.tononkiraako.add({
      titre,
      mpihira,
      tonony,
      created_at: new Date().toISOString()
    });
    
    navigate('/personal-songs');
  };

  return (
    <div className="min-h-screen bg-bg-main pb-10">
      <header className="sticky top-0 bg-bg-main/80 backdrop-blur-md z-10 px-4 py-4 flex items-center justify-between border-b border-border-main">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold">Nouvelle chanson</h1>
        <button 
          onClick={handleSave}
          disabled={!titre || !tonony}
          className="p-2 text-primary disabled:opacity-30"
        >
          <Save className="w-6 h-6" />
        </button>
      </header>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-main/30 ml-1">Titre</label>
          <input
            type="text"
            placeholder="Titre de la chanson"
            className="w-full bg-card-main border border-border-main rounded-xl py-3 px-4 outline-none focus:border-primary transition-colors"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-text-main/30 ml-1">Mpihira (Chanteur)</label>
          <input
            type="text"
            placeholder="Nom de l'interprète"
            className="w-full bg-card-main border border-border-main rounded-xl py-3 px-4 outline-none focus:border-primary transition-colors"
            value={mpihira}
            onChange={(e) => setMpihira(e.target.value)}
          />
        </div>

        <div className="space-y-2 relative">
          <label className="text-xs font-bold uppercase text-text-main/30 ml-1">Paroles</label>
          <div className="relative">
            <textarea
              placeholder="Saisissez ou collez les paroles ici..."
              className="w-full bg-card-main border border-border-main rounded-xl py-4 px-4 outline-none focus:border-primary transition-colors min-h-[300px] resize-none"
              value={tonony}
              onChange={(e) => setTonony(e.target.value)}
            />
            {isPasteEnabled && (
              <button 
                onClick={handlePaste}
                className="absolute top-3 right-3 p-2 bg-primary/10 text-primary rounded-lg active:scale-90 transition-transform flex items-center gap-2"
                title="Coller depuis le presse-papier"
              >
                <Clipboard className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Coller</span>
              </button>
            )}
          </div>
          {showPasteError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-black/80 text-white text-[10px] py-2 px-3 rounded-lg text-center backdrop-blur-sm"
            >
              Accès refusé. Utilisez l'appui long pour coller.
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
