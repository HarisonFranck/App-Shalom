import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/src/lib/db';
import { ChevronLeft, Save, Clipboard } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

export function EditFavoritePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const favorite = useLiveQuery(() => db.tononkiratiana.get(Number(id)), [id]);
  
  const [titre, setTitre] = useState('');
  const [mpihira, setMpihira] = useState('');
  const [tonony, setTonony] = useState('');

  useEffect(() => {
    if (favorite) {
      setTitre(favorite.titre);
      setMpihira(favorite.mpihira);
      setTonony(favorite.tonony);
    }
  }, [favorite]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTonony(prev => prev + text);
    } catch (err) {
      console.warn('Clipboard access restricted. Use Ctrl+V instead.');
    }
  };

  const handleSave = async () => {
    if (!id || !titre || !tonony) return;
    
    await db.tononkiratiana.update(Number(id), {
      titre,
      mpihira,
      tonony
    });
    
    navigate('/favorites');
  };

  if (!favorite) return null;

  return (
    <div className="min-h-screen bg-secondary pb-10">
      <header className="sticky top-0 bg-secondary/80 backdrop-blur-md z-10 px-4 py-4 flex items-center justify-between border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold">Modifier favori</h1>
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
          <label className="text-xs font-bold uppercase text-white/30 ml-1">Titre</label>
          <input
            type="text"
            placeholder="Titre de la chanson"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary transition-colors"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-white/30 ml-1">Mpihira (Chanteur)</label>
          <input
            type="text"
            placeholder="Nom de l'interprète"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary transition-colors"
            value={mpihira}
            onChange={(e) => setMpihira(e.target.value)}
          />
        </div>

        <div className="space-y-2 relative">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase text-white/30 ml-1">Paroles</label>
            <button 
              onClick={handlePaste}
              className="flex items-center gap-1 text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-1 rounded-md active:scale-95 transition-transform"
              title="Coller depuis le presse-papier"
            >
              <Clipboard className="w-3 h-3" /> Coller
            </button>
          </div>
          <textarea
            placeholder="Saisissez ou collez les paroles ici..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 outline-none focus:border-primary transition-colors min-h-[300px] resize-none"
            value={tonony}
            onChange={(e) => setTonony(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
