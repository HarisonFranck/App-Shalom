import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { Search, Music, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function SongsPage() {
  const [search, setSearch] = useState('');
  
  const songs = useLiveQuery(
    () => {
      if (!search) return db.tononkira.toArray();
      return db.tononkira
        .filter(s => 
          s.titre.toLowerCase().includes(search.toLowerCase()) || 
          s.mpihira.toLowerCase().includes(search.toLowerCase()) ||
          s.tonony.toLowerCase().includes(search.toLowerCase())
        )
        .toArray();
    },
    [search]
  );

  return (
    <div className="pb-20 px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Tononkira</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            placeholder="Rechercher un titre, mpihira..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="space-y-3">
        {songs?.map((song) => (
          <motion.div
            layout
            key={song.idtononkira}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
          >
            <Link to={`/songs/${song.idtononkira}`} className="p-4 flex items-center gap-4 active:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Music className="text-primary w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{song.titre}</h3>
                <p className="text-sm text-white/50 truncate">{song.mpihira}</p>
              </div>
              {song.tiana && <Heart className="w-5 h-5 text-red-500 fill-red-500" />}
            </Link>
          </motion.div>
        ))}
        
        {songs?.length === 0 && (
          <div className="text-center py-20">
            <Music className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/50">Aucune chanson trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
