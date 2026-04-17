import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { Search, User, Phone, Music, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function MembersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  const members = useLiveQuery(
    () => {
      if (!search) return db.membre.toArray();
      return db.membre
        .filter(m => 
          m.nom.toLowerCase().includes(search.toLowerCase()) || 
          m.prenom.toLowerCase().includes(search.toLowerCase()) ||
          m.telephone.includes(search)
        )
        .toArray();
    },
    [search]
  );

  const genres = useLiveQuery(() => db.genre.toArray());
  const feos = useLiveQuery(() => db.feo.toArray());

  const getGenreName = (id: string) => genres?.find(g => String(g.idgenre) === String(id))?.nom || '';
  const getFeoName = (id: string) => feos?.find(f => String(f.idfeo) === String(id))?.nom || '';

  return (
    <div className="min-h-screen bg-bg-main pb-20">
      <header className="sticky top-0 bg-bg-main/80 backdrop-blur-md z-10 px-4 py-4 flex items-center gap-4 border-b border-border-main">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Membres</h1>
      </header>

      <div className="px-4 pt-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-main/30" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            className="w-full bg-card-main border border-border-main rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {members?.map((member) => (
            <motion.div
              layout
              key={member.idmembre}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card-main rounded-2xl border border-border-main p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 border border-primary/20">
                {member.image && !failedImages.has(member.idmembre) ? (
                  <img 
                    src={member.image} 
                    alt={member.nom} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setFailedImages(prev => new Set(prev).add(member.idmembre))}
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{member.nom} {member.prenom}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {member.idfeo && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md">
                      <Music className="w-3 h-3" /> {getFeoName(member.idfeo)}
                    </span>
                  )}
                  {member.idgenre && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-text-main/5 text-text-main/40 text-[10px] font-bold uppercase rounded-md">
                      {getGenreName(member.idgenre)}
                    </span>
                  )}
                </div>
                {member.telephone && (
                  <a 
                    href={`tel:${member.telephone}`}
                    className="flex items-center gap-2 mt-2 text-sm text-text-main/60 hover:text-primary transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    {member.telephone}
                  </a>
                )}
              </div>
            </motion.div>
          ))}

          {members?.length === 0 && (
            <div className="text-center py-20">
              <User className="w-12 h-12 text-text-main/10 mx-auto mb-4" />
              <p className="text-text-main/50">Aucun membre trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
