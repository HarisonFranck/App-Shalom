import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { ChevronLeft, BookOpen, Quote, Calendar, Filter, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { isToday, isSameDay, startOfDay, differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { format } from 'date-fns';

const getStrictYMD = (d: string) => {
  if (!d) return '';
  const m = d.match(/(\d{4})[-/.](\d{2})[-/.](\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : d;
};

export function MpamakyTenyPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  const data = useLiveQuery(async () => {
    const allThemes = await db.lohahevitra.toArray();
    const allProgs = await db.lohahevitra_programme.toArray();
    const allMembers = await db.membre.toArray();
    const allVerses = await db.verset.toArray();
    const allProgTypes = await db.programme_type.toArray();

    const memberMap = new Map<string, any>(allMembers.flatMap(m => [[String(m.idmembre), m]]));
    const verseMap = new Map<string, any>(allVerses.flatMap(v => [[String(v.idverset), v]]));
    const progTypeMap = new Map<string, any>(allProgTypes.flatMap(pt => [[String(pt.id), pt]]));

    const progsByTheme = new Map();
    for (const prog of allProgs) {
      const themeIdStr = String(prog.idlohahevitra);
      if (!progsByTheme.has(themeIdStr)) {
        progsByTheme.set(themeIdStr, []);
      }
      progsByTheme.get(themeIdStr).push({
        ...prog,
        membre: memberMap.get(String(prog.idmembre)),
        verset: prog.idverset ? verseMap.get(String(prog.idverset)) : null,
        progType: progTypeMap.get(String(prog.idprogramme_type))
      });
    }

    for (const progs of progsByTheme.values()) {
      progs.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    }

    let filteredThemes = allThemes.filter(t => {
      const progs = progsByTheme.get(String(t.idlohahevitra)) || [];
      return progs.length > 0;
    });

    if (search) {
      const searchLower = search.toLowerCase();
      filteredThemes = filteredThemes.filter(t => {
        const themeMatches = t.nom.toLowerCase().includes(searchLower);
        const progs = progsByTheme.get(String(t.idlohahevitra)) || [];
        const memberMatches = progs.some(p =>
          p.membre && (
            p.membre.nom.toLowerCase().includes(searchLower) ||
            p.membre.prenom.toLowerCase().includes(searchLower)
          )
        );
        return themeMatches || memberMatches;
      });
    }

    if (dateFilter) {
      const targetYMD = getStrictYMD(dateFilter);
      filteredThemes = filteredThemes.filter(t => {
        return getStrictYMD(t.date) === targetYMD;
      });
    }

    filteredThemes.sort((a, b) => {
      const dateA = parseISO(getStrictYMD(a.date));
      const dateB = parseISO(getStrictYMD(b.date));
      return dateA.getTime() - dateB.getTime(); // Chronological (Jan to Dec)
    });

    return {
      themes: filteredThemes,
      progsByTheme
    };
  }, [search, dateFilter]);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedThemeId = searchParams.get('themeId');
  const selectedTheme = data?.themes?.find(t => String(t.idlohahevitra) === String(selectedThemeId));
  const programmes = selectedThemeId ? data?.progsByTheme?.get(String(selectedThemeId)) || [] : undefined;

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Intercept the back button when a theme is open
  const goBack = () => {
    if (selectedThemeId) {
      // Return to list by removing the search param (triggers popstate equivalent)
      navigate(-1);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main pb-10">
      <header className="sticky top-0 bg-bg-main/80 backdrop-blur-md z-10 px-4 py-4 flex items-center gap-4 border-b border-border-main">
        <button onClick={goBack} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold">Mpamaky Teny</h1>
      </header>

      <div className="p-4 space-y-4">
        {!selectedThemeId ? (
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
            
            <div className="space-y-3 pt-2">
              {data?.themes?.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen className="w-12 h-12 text-text-main/10 mx-auto mb-4" />
                  <p className="text-text-main/30 italic">Aucun programme trouvé</p>
                  <button 
                    onClick={() => { setSearch(''); setDateFilter(''); }}
                    className="mt-4 text-primary text-sm font-bold uppercase"
                  >
                    Réinitialiser
                  </button>
                </div>
              ) : (
                data?.themes?.map((theme, index) => {
                  const themeDate = parseISO(getStrictYMD(theme.date));
                  const isNearToday = Math.abs(differenceInDays(themeDate, startOfDay(new Date()))) <= 3;
                  const isTodayTheme = isSameDay(themeDate, startOfDay(new Date()));
                  
                  const monthName = themeDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                  const prevThemeDate = index > 0 ? parseISO(getStrictYMD(data.themes[index - 1].date)) : null;
                  const prevMonthName = prevThemeDate ? prevThemeDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : null;
                  const showMonthHeader = monthName !== prevMonthName;

                  const activeProgs = data?.progsByTheme?.get(String(theme.idlohahevitra)) || [];
                  const userPicsData = activeProgs.slice(0, 3).filter((p: any) => p.membre?.image).map((p: any) => ({
                    url: p.membre?.image as string,
                    id: String(p.membre?.idmembre)
                  }));

                  return (
                    <React.Fragment key={theme.idlohahevitra}>
                      {showMonthHeader && (
                        <div className="sticky top-16 z-10 bg-bg-main/90 backdrop-blur-sm py-2 px-1 mt-6 mb-2 first:mt-0">
                          <h2 className="text-sm font-black uppercase tracking-widest text-primary/80">
                            {monthName}
                          </h2>
                        </div>
                      )}
                      <motion.button
                        onClick={() => setSearchParams({ themeId: String(theme.idlohahevitra) })}
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
                          "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border",
                          isTodayTheme 
                            ? "bg-primary text-[#212121] border-primary" 
                            : "bg-primary/10 text-primary border-primary/20"
                        )}>
                          <span className="text-lg font-black leading-none">{themeDate.getDate()}</span>
                          <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-0.5">
                            {themeDate.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={cn("font-bold truncate text-base", isTodayTheme ? "text-text-main" : "text-primary/90")}>
                              {theme.nom}
                            </h3>
                          </div>
                          <p className="text-xs text-text-main/50 mt-1 flex items-center gap-1.5 font-medium">
                             <BookOpen className="w-3.5 h-3.5 text-primary/70"/>
                             <span>{activeProgs.length} lecteur(s) de la parole</span>
                          </p>
                        </div>
                        
                        {userPicsData.length > 0 && (
                           <div className="flex -space-x-2 shrink-0 border border-border-main/50 rounded-full p-0.5 bg-bg-main">
                             {userPicsData.map((picData, i: number) => (
                                <div key={i} className="w-7 h-7 rounded-full border border-bg-main overflow-hidden bg-primary/20 flex items-center justify-center">
                                  {!failedImages.has(picData.id) ? (
                                    <img 
                                      src={picData.url} 
                                      alt="" 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                      onError={() => setFailedImages(prev => new Set(prev).add(picData.id))}
                                    />
                                  ) : (
                                    <User className="w-4 h-4 text-primary" />
                                  )}
                                </div>
                             ))}
                           </div>
                        )}
                      </motion.button>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button 
              onClick={goBack}
              className="text-primary text-xs font-bold uppercase flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Retour à la liste
            </button>

            <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20">
              <h2 className="text-2xl font-black text-primary mb-2 leading-tight">{selectedTheme?.nom}</h2>
              <p className="text-sm text-text-main/60">{parseISO(getStrictYMD(selectedTheme?.date || '')).toLocaleDateString('fr-FR', { dateStyle: 'full' })}</p>
            </div>

            <div className="space-y-4">
              {programmes === undefined ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                </div>
              ) : programmes.length === 0 ? (
                <p className="text-center py-10 text-text-main/30 italic">Aucun programme assigné pour ce thème</p>
              ) : (
                programmes.map((prog, idx) => (
                  <div key={prog.id} className="bg-card-main rounded-2xl border border-border-main p-4 overflow-hidden relative">
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-primary/20">
                        {prog.membre?.image && !failedImages.has(prog.membre.idmembre) ? (
                          <img 
                            src={prog.membre.image} 
                            alt={prog.membre.nom} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => setFailedImages(prev => new Set(prev).add(prog.membre!.idmembre))}
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase text-primary tracking-widest">
                            {prog.libelle_personnalise || prog.progType?.libelle || `Responsable ${idx + 1}`}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg leading-tight mb-2">
                          {prog.membre ? `${prog.membre.nom} ${prog.membre.prenom}` : 'Membre inconnu'}
                        </h3>
                        
                        {prog.verset && (
                          <div className="mt-3 bg-bg-main/50 p-3 rounded-xl border border-border-main/50 relative">
                            <Quote className="absolute top-2 right-2 w-4 h-4 text-text-main/10" />
                            <p className="text-sm font-medium text-primary mb-1">{prog.verset.verset}</p>
                            <p className="text-sm text-text-main/70 italic leading-relaxed line-clamp-3">"{prog.verset.parole}"</p>
                          </div>
                        )}
                        
                        {prog.note && (
                          <p className="mt-2 text-xs text-text-main/50 italic bg-primary/5 p-2 rounded-lg border border-primary/10">
                            Note: {prog.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
