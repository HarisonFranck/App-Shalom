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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTonony(prev => prev + text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
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
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase text-text-main/30 ml-1">Paroles</label>
            <button 
              onClick={handlePaste}
              className="flex items-center gap-1 text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-1 rounded-md"
            >
              <Clipboard className="w-3 h-3" /> Coller
            </button>
          </div>
          <textarea
            placeholder="Saisissez ou collez les paroles ici..."
            className="w-full bg-card-main border border-border-main rounded-xl py-4 px-4 outline-none focus:border-primary transition-colors min-h-[300px] resize-none"
            value={tonony}
            onChange={(e) => setTonony(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
