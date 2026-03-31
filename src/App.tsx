import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './components/HomePage';
import { SongsPage } from './components/SongsPage';
import { SongDetailPage } from './components/SongDetailPage';
import { EventsPage } from './components/EventsPage';
import { ProjectsPage } from './components/ProjectsPage';
import { SettingsPage } from './components/SettingsPage';
import { AddPersonalSong } from './components/AddPersonalSong';
import { PersonalSongsPage } from './components/PersonalSongsPage';
import { SundayThemes } from './components/SundayThemes';
import { FavoritesPage } from './components/FavoritesPage';
import { FavoriteDetailPage } from './components/FavoriteDetailPage';
import { EditFavoritePage } from './components/EditFavoritePage';
import { syncData } from './lib/syncService';
import { checkUpcomingReminders } from './lib/notificationService';

export default function App() {
  useEffect(() => {
    // Initial sync on mount
    syncData();
    // Check for reminders
    checkUpcomingReminders();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-secondary text-white pb-20 max-w-md mx-auto relative shadow-2xl shadow-black/50 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/songs" element={<SongsPage />} />
            <Route path="/songs/:id" element={<SongDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/add-personal-song" element={<AddPersonalSong />} />
            <Route path="/personal-songs" element={<PersonalSongsPage />} />
            <Route path="/sunday-themes" element={<SundayThemes />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/favorite-detail/:id" element={<FavoriteDetailPage />} />
            <Route path="/edit-favorite/:id" element={<EditFavoritePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </ThemeProvider>
  );
}
