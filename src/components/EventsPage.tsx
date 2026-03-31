import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const events = useLiveQuery(() => db.evenement.toArray());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectedDayEvents = events?.filter(e => isSameDay(new Date(e.date_debut), currentDate)) || [];

  return (
    <div className="pb-20 px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Événements</h1>

      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6 bg-card-main p-4 rounded-2xl border border-border-main">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold capitalize">{format(currentDate, 'MMMM yyyy', { locale: fr })}</h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-text-main/30 uppercase">{d}</div>
        ))}
        {days.map((day) => {
          const hasEvent = events?.some(e => isSameDay(new Date(e.date_debut), day));
          const isSelected = isSameDay(day, currentDate);
          
          return (
            <button
              key={day.toString()}
              onClick={() => setCurrentDate(day)}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all",
                isSelected ? "bg-primary text-[#212121] font-bold" : "bg-card-main text-text-main/80",
                !isSelected && hasEvent && "border border-primary/30"
              )}
            >
              <span>{format(day, 'd')}</span>
              {hasEvent && !isSelected && (
                <div className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Events */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase text-text-main/40 tracking-wider">
          {format(currentDate, 'EEEE d MMMM', { locale: fr })}
        </h3>
        
        {selectedDayEvents.length > 0 ? (
          selectedDayEvents.map((event) => (
            <div key={event.idevenement} className="bg-card-main p-4 rounded-2xl border border-border-main">
              <h4 className="font-bold text-primary mb-2">{event.nom}</h4>
              <div className="space-y-2 text-sm text-text-main/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(event.date_debut), 'HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.lieu}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-text-main/80">{event.description}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-card-main rounded-2xl border border-dashed border-border-main">
            <p className="text-text-main/30 text-sm italic">Aucun événement ce jour</p>
          </div>
        )}
      </div>
    </div>
  );
}
