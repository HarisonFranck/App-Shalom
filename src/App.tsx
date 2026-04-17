import React, { useEffect, useState } from 'react';
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
import { PersonalSongDetailPage } from './components/PersonalSongDetailPage';
import { SundayThemes } from './components/SundayThemes';
import { MpamakyTenyPage } from './components/MpamakyTenyPage';
import { MembersPage } from './components/MembersPage';
import { FavoritesPage } from './components/FavoritesPage';
import { FavoriteDetailPage } from './components/FavoriteDetailPage';
import { EditFavoritePage } from './components/EditFavoritePage';
import { SplashScreen } from './components/SplashScreen';
import { ErrorModal } from './components/ErrorModal';
import { syncData } from './lib/syncService';
import { checkUpcomingReminders } from './lib/notificationService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; type: 'connection' | 'sync' | 'generic' } | null>(null);

  useEffect(() => {
    // Initial sync on mount
    const initSync = async () => {
      try {
        await syncData();
      } catch (err: any) {
        // Log as warning instead of error for expected network issues
        if (err.message?.includes('fifandraisana') || err.message?.includes('internet')) {
          console.warn('Sync skipped due to network/connection issue:', err.message);
          setErrorInfo({
            title: 'Tsy nandeha ny sync',
            message: 'Tsy afaka nampifanindry ny angona izahay satria tsy misy internet na ratsy ny fifandraisana. Afaka mampiasa ny app offline ianao.',
            type: 'connection'
          });
        } else {
          console.error('Initial sync failed:', err);
        }
      }
    };

    initSync();
    // Check for reminders
    checkUpcomingReminders();
  }, []);

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Router>
        <div className="min-h-screen bg-bg-main text-text-main pb-20 max-w-md mx-auto relative shadow-2xl shadow-black/50 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/songs" element={<SongsPage />} />
            <Route path="/songs/:id" element={<SongDetailPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/add-personal-song" element={<AddPersonalSong />} />
            <Route path="/personal-songs" element={<PersonalSongsPage />} />
            <Route path="/personal-songs/:id" element={<PersonalSongDetailPage />} />
            <Route path="/sunday-themes" element={<SundayThemes />} />
            <Route path="/mpamaky-teny" element={<MpamakyTenyPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/favorite-detail/:id" element={<FavoriteDetailPage />} />
            <Route path="/edit-favorite/:id" element={<EditFavoritePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
      
      <ErrorModal
        isOpen={!!errorInfo}
        onClose={() => setErrorInfo(null)}
        title={errorInfo?.title || ''}
        message={errorInfo?.message || ''}
        type={errorInfo?.type}
        onRetry={errorInfo?.type === 'connection' ? () => syncData() : undefined}
      />
    </ThemeProvider>
  );
}
