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
  const isPasteEnabled = localStorage.getItem('paste_enabled') === 'true';

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
      if (text) {
        setTonony(prev => prev + (prev ? '\n' : '') + text);
      }
    } catch (err) {
      console.warn('Clipboard access restricted. Use long press to paste.');
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
    <div className="min-h-screen bg-bg-main pb-10">
      <header className="sticky top-0 bg-bg-main/80 backdrop-blur-md z-10 px-4 py-4 flex items-center justify-between border-b border-border-main">
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
        </div>
      </div>
    </div>
  );
}
