import React, { useState, useMemo } from 'react';
import Slider from 'react-slick';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { Music, Calendar, ChevronRight, Menu, Quote, Bell, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Drawer } from './Drawer';
import { isToday, isTomorrow, isWithinInterval, addDays, startOfDay } from 'date-fns';
import { cn } from '@/src/lib/utils';

export function HomePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const recentSongs = useLiveQuery(() => db.tononkira.limit(5).toArray());
  const upcomingEvents = useLiveQuery(() => db.evenement.toArray());
  const upcomingProjects = useLiveQuery(() => db.projet.toArray());

  const dynamicSlides = useMemo(() => {
    const slides = [
      {
        title: "Matio 11:28",
        subtitle: "Mankanesa atỳ amiko, hianareo rehetra izay miasa fatratra sy mavesatra entana, fa Izaho no hanome anareo fitsaharana.",
        type: "Verset",
        color: "bg-primary"
      },
      {
        title: "Salamo 23:1",
        subtitle: "Jehovah no Mpiandry ahy; tsy hanan-java-mahory aho.",
        type: "Verset",
        color: "bg-primary"
      },
      {
        title: "Filipiana 4:13",
        subtitle: "Mahay ny zavatra rehetra aho ao amin'Ilay mampahery ahy.",
        type: "Verset",
        color: "bg-primary"
      },
      {
        title: "Jeremia 29:11",
        subtitle: "Fa Izaho mahalala ny hevitra eritreretiko ny aminareo, dia hevitra hahatonga fiadanana, fa tsy loza, mba hanome anareo fanantenana ny amin'ny farany.",
        type: "Verset",
        color: "bg-primary"
      },
      {
        title: "Salamo 121:1-2",
        subtitle: "Manandratra ny masoko ho amin'ny tendrombohitra aho; avy aiza ny famonjena ahy? Ny famonjena ahy dia avy amin'i Jehovah, Mpanao ny lanitra sy ny tany.",
        type: "Verset",
        color: "bg-primary"
      },
      {
        title: "Fampaherezana",
        subtitle: "Aza hadino ny mivavaka isan'andro. Ny vavaka no herin'ny mpino.",
        type: "Hafatra",
        color: "bg-primary"
      }
    ];

    // Add event notifications
    const today = startOfDay(new Date());
    const nextWeek = addDays(today, 7);

    upcomingEvents?.forEach(event => {
      const eventDate = new Date(event.date_debut);
      if (isToday(eventDate)) {
        slides.unshift({
          title: "Androany !",
          subtitle: `Hetsika: ${event.nom}. Manomboka izao !`,
          type: "Fampandrenesana",
          color: "bg-red-500"
        });
      } else if (isTomorrow(eventDate)) {
        slides.unshift({
          title: "Rahampitso !",
          subtitle: `Aza adino ny hetsika "${event.nom}" rahampitso.`,
          type: "Fampandrenesana",
          color: "bg-orange-500"
        });
      } else if (isWithinInterval(eventDate, { start: today, end: nextWeek })) {
        slides.push({
          title: "Amin'ity herinandro ity",
          subtitle: `Hetsika ho avy: "${event.nom}". Miomàna !`,
          type: "Fampandrenesana",
          color: "bg-blue-500"
        });
      }
    });

    // Add project notifications
    upcomingProjects?.forEach(project => {
      const projectDate = new Date(project.date_debut);
      if (isWithinInterval(projectDate, { start: today, end: nextWeek })) {
        slides.push({
          title: "Tetikasa lehibe",
          subtitle: `Hanomboka tsy ho ela ny tetikasa "${project.nom}".`,
          type: "Tetikasa",
          color: "bg-green-600"
        });
      }
    });

    return slides;
  }, [upcomingEvents, upcomingProjects]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: false,
    fade: true,
  };

  return (
    <div className="pb-20">
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      {/* Top Header */}
      <header className="px-4 py-4 flex justify-between items-center bg-bg-main/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="text-primary font-black">S</div>';
              }}
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-lg font-black tracking-tighter">SHALOM</h1>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 bg-card-main rounded-lg active:scale-90 transition-transform"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Hero Carousel */}
      <section className="mb-8 px-4">
        <Slider {...sliderSettings} className="rounded-3xl overflow-hidden shadow-2xl">
          {dynamicSlides.map((slide, i) => (
            <div key={i} className="relative h-64 outline-none">
              <div className={cn("absolute inset-0 flex flex-col justify-center p-8 text-[#212121] transition-colors duration-500", slide.color || "bg-primary")}>
                <Quote className="w-12 h-12 opacity-10 absolute top-4 right-4" />
                <div className="flex items-center gap-2 mb-2">
                  {slide.type === "Fampandrenesana" && <Bell className="w-3 h-3" />}
                  {slide.type === "Tetikasa" && <Info className="w-3 h-3" />}
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{slide.type}</span>
                </div>
                <h2 className="text-2xl font-black mb-4 leading-tight">{slide.title}</h2>
                <p className="text-lg font-medium leading-relaxed italic">"{slide.subtitle}"</p>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      <div className="px-4 space-y-8">
        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <Link to="/songs" className="bg-card-main p-4 rounded-2xl border border-border-main flex flex-col items-center text-center space-y-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Music className="text-primary w-6 h-6" />
            </div>
            <span className="font-semibold">Chansons</span>
          </Link>
          <Link to="/events" className="bg-card-main p-4 rounded-2xl border border-border-main flex flex-col items-center text-center space-y-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Calendar className="text-primary w-6 h-6" />
            </div>
            <span className="font-semibold">Événements</span>
          </Link>
        </section>

        {/* Recent Songs */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Chansons récentes</h3>
            <Link to="/songs" className="text-primary text-sm flex items-center">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentSongs?.map((song) => (
              <motion.div 
                key={song.idtononkira}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card-main p-4 rounded-xl border border-border-main flex justify-between items-center"
              >
                <div>
                  <h4 className="font-medium line-clamp-1">{song.titre}</h4>
                  <p className="text-xs text-text-main/50">{song.mpihira}</p>
                </div>
                <Link to={`/songs/${song.idtononkira}`} className="p-2 bg-primary/10 rounded-lg">
                  <Music className="w-4 h-4 text-primary" />
                </Link>
              </motion.div>
            ))}
            {(!recentSongs || recentSongs.length === 0) && (
              <p className="text-text-main/30 text-center py-4 italic">Aucune chanson synchronisée</p>
            )}
          </div>
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Prochains événements</h3>
            <Link to="/events" className="text-primary text-sm flex items-center">
              Calendrier <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingEvents?.map((event) => (
              <div key={event.idevenement} className="flex gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex flex-col items-center justify-center text-primary border border-primary/20">
                  <span className="text-xs font-bold uppercase">{new Date(event.date_debut).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                  <span className="text-xl font-black">{new Date(event.date_debut).getDate()}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold line-clamp-1">{event.nom}</h4>
                  <p className="text-xs text-text-main/50 line-clamp-2">{event.description}</p>
                </div>
              </div>
            ))}
            {(!upcomingEvents || upcomingEvents.length === 0) && (
              <p className="text-text-main/30 text-center py-4 italic">Aucun événement à venir</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
