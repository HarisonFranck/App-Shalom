import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { Heart, Trash2, Edit2, ChevronLeft, Music } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function FavoritesPage() {
  const navigate = useNavigate();
  const favorites = useLiveQuery(() => db.tononkiratiana.toArray());

  const handleDelete = async (id: number) => {
    if (confirm('Miala tsiny indrindra, saingy azo antoka ve fa tianao hovafana tokoa ity hira ity amin\'ny lisitry ny tianao?')) {
      await db.tononkiratiana.delete(id);
    }
  };

  return (
    <div className="min-h-screen bg-secondary pb-20 px-4 pt-6">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Mes favoris</h1>
      </header>

      <div className="space-y-3">
        {favorites?.map((song) => (
          <div key={song.id} className="bg-white/5 rounded-xl border border-white/10 flex items-center p-4 gap-4">
            <Link to={`/favorite-detail/${song.id}`} className="flex-1 flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Heart className="text-red-500 w-5 h-5 fill-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{song.titre}</h3>
                <p className="text-xs text-white/50 truncate">{song.mpihira}</p>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <Link to={`/edit-favorite/${song.id}`} className="p-2 text-white/40 hover:text-primary">
                <Edit2 className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => handleDelete(song.id!)}
                className="p-2 text-red-500/50 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {favorites?.length === 0 && (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/50">Votre liste de favoris est vide</p>
            <Link to="/songs" className="inline-block mt-4 text-primary font-bold">
              Découvrir des chansons
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
