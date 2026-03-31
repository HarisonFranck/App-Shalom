import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { ChevronLeft, BookOpen, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function SundayThemes() {
  const navigate = useNavigate();
  const themes = useLiveQuery(() => db.lohahevitra.orderBy('date').reverse().toArray());
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  const selectedTheme = themes?.find(t => t.idlohahevitra === selectedThemeId);
  
  const monthlyTheme = useLiveQuery(async () => {
    if (!selectedTheme?.idlohahevitravolana) return null;
    return db.lohahevitravolana.get(selectedTheme.idlohahevitravolana);
  }, [selectedTheme]);

  const versesWithType = useLiveQuery(async () => {
    if (!selectedThemeId) return [];
    
    // Try both string and number ID lookups for the links
    let links = await db.lohahevitra_verset.where('idlohahevitra').equals(selectedThemeId).toArray();
    if (links.length === 0) {
      links = await db.lohahevitra_verset.where('idlohahevitra').equals(Number(selectedThemeId)).toArray();
    }
    if (links.length === 0) {
      links = await db.lohahevitra_verset.where('idlohahevitra').equals(String(selectedThemeId)).toArray();
    }
    
    const results = await Promise.all(links.map(async (link) => {
      // Try both string and number ID lookups for the verse itself
      let verseData = await db.verset.get(link.idverset);
      if (!verseData) {
        verseData = await db.verset.get(Number(link.idverset));
      }
      if (!verseData) {
        verseData = await db.verset.get(String(link.idverset));
      }
      return { ...verseData, type: link.type };
    }));

    return results.filter(r => r.idverset); // Filter out any missing verses
  }, [selectedThemeId]);

  const isLoadingVerses = selectedThemeId && versesWithType === undefined;

  const groupedVerses = {
    primary: versesWithType?.filter(v => v.type === 'primary') || [],
    secondary: versesWithType?.filter(v => v.type === 'secondary') || [],
    tertiary: versesWithType?.filter(v => v.type === 'tertiary') || [],
  };

  return (
    <div className="min-h-screen bg-secondary pb-10">
      <header className="sticky top-0 bg-secondary/80 backdrop-blur-md z-10 px-4 py-4 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold">Lohahevitra Alahady</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Themes List */}
        {!selectedThemeId ? (
          <div className="space-y-3">
            {themes?.map((theme) => (
              <motion.button
                key={theme.idlohahevitra}
                onClick={() => setSelectedThemeId(theme.idlohahevitra)}
                className="w-full text-left bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex flex-col items-center justify-center text-primary shrink-0">
                  <span className="text-[10px] font-bold">{new Date(theme.date).getDate()}</span>
                  <span className="text-[10px] uppercase">{new Date(theme.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-primary truncate">{theme.nom}</h3>
                  <p className="text-xs text-white/40">{theme.andro || 'Alahady'}</p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          /* Theme Detail & Verses */
          <div className="space-y-6">
            <button 
              onClick={() => setSelectedThemeId(null)}
              className="text-primary text-xs font-bold uppercase flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Retour à la liste
            </button>

            {/* Monthly Theme Header */}
            {monthlyTheme && (
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-4">
                <span className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">Lohahevitra Volana ({monthlyTheme.volana})</span>
                <h3 className="text-lg font-bold text-white mt-1">{monthlyTheme.lohahevitra}</h3>
              </div>
            )}

            <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20">
              <h2 className="text-2xl font-black text-primary mb-2 leading-tight">{selectedTheme?.nom}</h2>
              <p className="text-sm text-white/60">{new Date(selectedTheme?.date || '').toLocaleDateString('fr-FR', { dateStyle: 'full' })}</p>
            </div>

            <div className="space-y-8">
              {/* Loading State */}
              {isLoadingVerses && (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
              )}

              {/* Grouped Verses */}
              {!isLoadingVerses && (['primary', 'secondary', 'tertiary'] as const).map((type) => {
                const verses = groupedVerses[type];
                if (verses.length === 0) return null;

                const typeLabels = {
                  primary: 'Verset fototra',
                  secondary: 'Verset fanampiny',
                  tertiary: 'Verset fameno'
                };

                return (
                  <div key={type} className="space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-white/30">
                      <BookOpen className="w-4 h-4" /> {typeLabels[type]}
                    </h3>
                    
                    {verses.map((v) => (
                      <div key={v.idverset} className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                        <Quote className="absolute -top-2 -right-2 w-16 h-16 text-white/5" />
                        <p className="text-lg leading-relaxed mb-4 italic">"{v.parole}"</p>
                        <p className="text-right font-bold text-primary">— {v.verset}</p>
                      </div>
                    ))}
                  </div>
                );
              })}

              {!isLoadingVerses && versesWithType?.length === 0 && (
                <p className="text-center py-10 text-white/30 italic">Aucun verset associé</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
