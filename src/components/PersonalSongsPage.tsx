import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { Music, Trash2, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function PersonalSongsPage() {
  const navigate = useNavigate();
  const songs = useLiveQuery(() => db.tononkiraako.toArray());

  const handleDelete = async (id: number) => {
    if (confirm('Miala tsiny indrindra, saingy azo antoka ve fa tianao hofafana tokoa ity hira ity amin\'ny lisitry ny hira anao?')) {
      await db.tononkiraako.delete(id);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main pb-20 px-4 pt-6">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Mes chansons</h1>
      </header>

      <div className="space-y-3">
        {songs?.map((song) => (
          <div key={song.id} className="bg-card-main rounded-xl border border-border-main flex items-center p-4 gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Music className="text-primary w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{song.titre}</h3>
              <p className="text-xs text-text-main/50 truncate">{song.mpihira}</p>
            </div>
            <button 
              onClick={() => handleDelete(song.id!)}
              className="p-2 text-red-500/50 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {songs?.length === 0 && (
          <div className="text-center py-20">
            <Music className="w-12 h-12 text-text-main/10 mx-auto mb-4" />
            <p className="text-text-main/50">Vous n'avez pas encore ajouté de chansons personnelles</p>
            <Link to="/add-personal-song" className="inline-block mt-4 text-primary font-bold">
              Ajouter ma première chanson
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
