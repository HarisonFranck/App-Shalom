import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { Briefcase, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ProjectsPage() {
  const projects = useLiveQuery(() => db.projet.toArray());

  return (
    <div className="pb-20 px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Projets</h1>
      
      <div className="space-y-6">
        {projects?.map((project) => (
          <div key={project.idprojet} className="bg-card-main rounded-2xl border border-border-main overflow-hidden">
            {project.image && (
              <img 
                src={project.image} 
                alt={project.nom} 
                className="w-full h-48 object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="p-5">
              <h3 className="text-xl font-bold text-primary mb-3">{project.nom}</h3>
              <p className="text-text-main/70 text-sm mb-4 line-clamp-3">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-main">
                <div className="flex items-center gap-2 text-xs text-text-main/40">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(project.date_debut), 'MMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-main/40">
                  <Users className="w-4 h-4" />
                  <span>{project.participant}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {(!projects || projects.length === 0) && (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-text-main/10 mx-auto mb-4" />
            <p className="text-text-main/50">Aucun projet en cours</p>
          </div>
        )}
      </div>
    </div>
  );
}
