import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { ChevronLeft, BookOpen, Quote, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { isToday, isSameDay, startOfDay, differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';

const getStrictYMD = (d: string) => {
  if (!d) return '';
  const m = d.match(/(\d{4})[-/.](\d{2})[-/.](\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : d;
};

export function SundayThemes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  const themes = useLiveQuery(() => {
    let query = db.lohahevitra.toArray();
    return query.then(items => {
      let filtered = items;
      
      if (search) {
        filtered = filtered.filter(t => 
          t.nom.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (dateFilter) {
        const targetYMD = getStrictYMD(dateFilter);
        filtered = filtered.filter(t => {
           return getStrictYMD(t.date) === targetYMD;
        });
      }
      
      // Sort by date: oldest first (Jan to Dec)
      return filtered.sort((a, b) => {
        const dateA = parseISO(getStrictYMD(a.date));
        const dateB = parseISO(getStrictYMD(b.date));
        return dateA.getTime() - dateB.getTime();
      });
    });
  }, [search, dateFilter]);

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
    <div className="min-h-screen bg-bg-main pb-10">
      <header className="sticky top-0 bg-bg-main/80 backdrop-blur-md z-10 px-4 py-4 flex items-center gap-4 border-b border-border-main">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold">Lohahevitra Alahady</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Filter Controls */}
        {!selectedThemeId && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/30" />
                <input
                  type="text"
                  placeholder="Rechercher un thème..."
                  className="w-full bg-card-main border border-border-main rounded-xl py-3 pl-9 pr-4 text-sm outline-none focus:border-primary transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative flex items-center justify-center">
                <div
                  className={cn(
                    "p-3 rounded-xl border transition-all flex items-center justify-center",
                    dateFilter ? "bg-primary border-primary text-[#212121]" : "bg-card-main border-border-main text-primary"
                  )}
                >
                  <Calendar className="w-5 h-5 pointer-events-none" />
                </div>
                <input
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 appearance-none"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <button
                onClick={() => setDateFilter(format(new Date(), 'yyyy-MM-dd'))}
                className={cn(
                  "px-4 py-3 rounded-xl border text-xs font-bold uppercase transition-all",
                  dateFilter && isSameDay(parseISO(dateFilter), new Date())
                    ? "bg-primary border-primary text-[#212121]"
                    : "bg-card-main border-border-main text-text-main/40"
                )}
              >
                Aujourd'hui
              </button>
            </div>

            {(search || dateFilter) && (
              <div className="flex flex-wrap gap-2">
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="px-3 py-1.5 bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase rounded-full flex items-center gap-2"
                  >
                    Date: {parseISO(dateFilter).toLocaleDateString('fr-FR')}
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                )}
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="px-3 py-1.5 bg-card-main border border-border-main text-text-main/60 text-[10px] font-bold uppercase rounded-full flex items-center gap-2"
                  >
                    Recherche: {search}
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                )}
                <button
                  onClick={() => { setSearch(''); setDateFilter(''); }}
                  className="text-[10px] font-bold uppercase text-text-main/30 hover:text-text-main transition-colors ml-auto"
                >
                  Effacer tout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Themes List */}
        {!selectedThemeId ? (
          <div className="space-y-3">
            {themes?.length === 0 ? (
              <div className="text-center py-20">
                <Filter className="w-12 h-12 text-text-main/10 mx-auto mb-4" />
                <p className="text-text-main/30 italic">Aucun thème trouvé pour ces critères</p>
                <button 
                  onClick={() => { setSearch(''); setDateFilter(''); }}
                  className="mt-4 text-primary text-sm font-bold uppercase"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              themes?.map((theme) => {
              const themeDate = parseISO(getStrictYMD(theme.date));
              const isNearToday = Math.abs(differenceInDays(themeDate, startOfDay(new Date()))) <= 3;
              const isTodayTheme = isSameDay(themeDate, startOfDay(new Date()));

              return (
                <motion.button
                  key={theme.idlohahevitra}
                  onClick={() => setSelectedThemeId(theme.idlohahevitra)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98]",
                    isTodayTheme 
                      ? "bg-primary/20 border-primary shadow-lg shadow-primary/10" 
                      : isNearToday
                        ? "bg-card-main border-primary/30"
                        : "bg-card-main border-border-main"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0",
                    isTodayTheme ? "bg-primary text-[#212121]" : "bg-primary/10 text-primary"
                  )}>
                    <span className="text-[10px] font-bold">{themeDate.getDate()}</span>
                    <span className="text-[10px] uppercase">{themeDate.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn("font-bold truncate", isTodayTheme ? "text-text-main" : "text-primary")}>
                        {theme.nom}
                      </h3>
                      {isTodayTheme && (
                        <span className="px-1.5 py-0.5 bg-primary text-[#212121] text-[8px] font-black uppercase rounded">Aujourd'hui</span>
                      )}
                    </div>
                    <p className="text-xs text-text-main/40">{theme.andro || 'Alahady'}</p>
                  </div>
                </motion.button>
              );
            }))}
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
              <div className="bg-card-main p-4 rounded-2xl border border-border-main mb-4">
                <span className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">Lohahevitra Volana ({monthlyTheme.volana})</span>
                <h3 className="text-lg font-bold text-text-main mt-1">{monthlyTheme.lohahevitra}</h3>
              </div>
            )}

            <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20">
              <h2 className="text-2xl font-black text-primary mb-2 leading-tight">{selectedTheme?.nom}</h2>
              <p className="text-sm text-text-main/60">{parseISO(getStrictYMD(selectedTheme?.date || '')).toLocaleDateString('fr-FR', { dateStyle: 'full' })}</p>
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
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-text-main/30">
                      <BookOpen className="w-4 h-4" /> {typeLabels[type]}
                    </h3>
                    
                    {verses.map((v) => (
                      <div key={v.idverset} className="bg-card-main p-6 rounded-2xl border border-border-main relative overflow-hidden">
                        <Quote className="absolute -top-2 -right-2 w-16 h-16 text-text-main/5" />
                        <p className="text-lg leading-relaxed mb-4 italic">"{v.parole}"</p>
                        <p className="text-right font-bold text-primary">— {v.verset}</p>
                      </div>
                    ))}
                  </div>
                );
              })}

              {!isLoadingVerses && versesWithType?.length === 0 && (
                <p className="text-center py-10 text-text-main/30 italic">Aucun verset associé</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
