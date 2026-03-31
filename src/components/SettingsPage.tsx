import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, Monitor, RefreshCw, Info, Shield, LogOut, Bell, Trash2, Clipboard } from 'lucide-react';
import { syncData, resetLohahevitra } from '@/src/lib/syncService';
import { requestNotificationPermission, checkUpcomingReminders } from '@/src/lib/notificationService';
import { motion } from 'motion/react';
import { db } from '@/src/lib/db';
import { Capacitor } from '@capacitor/core';
import { ConfirmationModal } from './ConfirmationModal';
import { ErrorModal } from './ErrorModal';
import { cn } from '@/src/lib/utils';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [lastReset, setLastReset] = useState<number | null>(null);
  const [isPasteEnabled, setIsPasteEnabled] = useState(() => {
    return localStorage.getItem('paste_enabled') === 'true';
  });

  const [notifError, setNotifError] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; type: 'connection' | 'sync' | 'generic' } | null>(null);

  useEffect(() => {
    localStorage.setItem('paste_enabled', isPasteEnabled.toString());
  }, [isPasteEnabled]);

  useEffect(() => {
    const checkPermission = async () => {
      const isNative = Capacitor.isNativePlatform();
      if (isNative) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const status = await LocalNotifications.checkPermissions();
        setNotifPermission(status.display === 'granted' ? 'granted' : status.display === 'denied' ? 'denied' : 'default');
      } else if (!('Notification' in window)) {
        setNotifError("Navigateur non supporté");
      } else {
        setNotifPermission(Notification.permission);
      }
    };
    
    checkPermission();
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const syncLog = await db.syncLogs.where('tableName').equals('global_sync').first();
    const resetLog = await db.syncLogs.where('tableName').equals('last_reset').first();
    if (syncLog) setLastSync(syncLog.lastSyncAt);
    if (resetLog) setLastReset(resetLog.lastSyncAt);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Jamais';
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncData();
      await fetchLogs();
    } catch (err: any) {
      setErrorInfo({
        title: 'Tsy nandeha ny sync',
        message: err.message || 'Nisy olana kely tamin\'ny fampitambarana ny angona.',
        type: err.message?.includes('internet') ? 'connection' : 'sync'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetLohahevitra();
      await fetchLogs();
      setShowResetConfirm(false);
    } catch (err: any) {
      console.error('Reset failed:', err);
      setErrorInfo({
        title: 'Tsy nandeha ny reset',
        message: err.message || 'Nisy olana kely tamin\'ny famerenana ny angona.',
        type: err.message?.includes('internet') ? 'connection' : 'sync'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleEnableNotifications = async () => {
    console.log('Requesting notification permission...');
    setNotifError(null);
    
    const isNative = Capacitor.isNativePlatform();
    
    if (!isNative && !('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      setNotifError("Navigateur non supporté");
      return;
    }

    if (!isNative && Notification.permission === 'denied') {
      console.warn('Notification permission already denied');
      setNotifError("Notifications bloquées");
      return;
    }

    try {
      const granted = await requestNotificationPermission();
      console.log('Permission result:', granted);
      
      // Small delay to ensure permission is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update state based on actual current permission
      if (isNative) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const status = await LocalNotifications.checkPermissions();
        setNotifPermission(status.display === 'granted' ? 'granted' : status.display === 'denied' ? 'denied' : 'default');
      } else {
        setNotifPermission(Notification.permission);
      }
      
      if (granted) {
        checkUpcomingReminders();
      } else {
        if (!isNative && (Notification.permission as string) === 'denied') {
          setNotifError("Notifications bloquées");
        } else {
          setNotifError("Permission refusée");
        }
      }
    } catch (err) {
      console.error('Failed to enable notifications:', err);
      setNotifError("Erreur d'activation");
    }
  };

  return (
    <div className="pb-20 px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <section>
          <h3 className="text-xs font-bold uppercase text-text-main/30 mb-3 ml-1">Apparence</h3>
          <div className="bg-card-main rounded-2xl border border-border-main overflow-hidden">
            <div className="flex p-1">
              {[
                { id: 'light', icon: Sun, label: 'Clair' },
                { id: 'dark', icon: Moon, label: 'Sombre' },
                { id: 'system', icon: Monitor, label: 'Système' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id as any)}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${
                    theme === item.id ? 'bg-primary text-[#212121] font-bold' : 'text-text-main/50'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="text-xs font-bold uppercase text-text-main/30 mb-3 ml-1">Notifications</h3>
          <div className="bg-card-main rounded-2xl border border-border-main p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Rappels d'événements</p>
                <p className={`text-xs ${notifError ? 'text-red-400' : 'text-text-main/40'}`}>
                  {notifError || (notifPermission === 'granted' ? 'Activées' : notifPermission === 'denied' ? 'Bloquées' : 'Désactivées')}
                </p>
              </div>
            </div>
            {notifPermission !== 'granted' && (
              <button 
                onClick={handleEnableNotifications}
                className="bg-primary text-[#212121] px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Activer
              </button>
            )}
          </div>
        </section>

        {/* Fonctionnalités */}
        <section>
          <h3 className="text-xs font-bold uppercase text-text-main/30 mb-3 ml-1">Fonctionnalités</h3>
          <div className="bg-card-main rounded-2xl border border-border-main p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clipboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Bouton "Coller"</p>
                <p className="text-xs text-text-main/40">Activer le bouton de collage automatique</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPasteEnabled(!isPasteEnabled)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-200 ease-in-out",
                isPasteEnabled ? "bg-primary" : "bg-text-main/10"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ease-in-out",
                isPasteEnabled ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </section>

        {/* Sync */}
        <section>
          <h3 className="text-xs font-bold uppercase text-text-main/30 mb-3 ml-1">Données</h3>
          <div className="space-y-3">
            <div className="bg-card-main rounded-2xl border border-border-main p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <RefreshCw className={`w-5 h-5 text-primary ${isSyncing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="font-medium">Synchronisation</p>
                  <p className="text-xs text-text-main/40">Dernière sync : {formatDate(lastSync)}</p>
                </div>
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-primary text-[#212121] px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                {isSyncing ? 'En cours...' : 'Sync'}
              </button>
            </div>

            <div className="bg-card-main rounded-2xl border border-border-main p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Réinitialiser Lohahevitra</p>
                  <p className="text-xs text-text-main/40">Dernier reset : {formatDate(lastReset)}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowResetConfirm(true)}
                disabled={isResetting}
                className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                {isResetting ? 'Réinitialisation...' : 'Reset'}
              </button>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="text-xs font-bold uppercase text-text-main/30 mb-3 ml-1">À propos</h3>
          <div className="bg-card-main rounded-2xl border border-border-main divide-y divide-border-main">
            <button className="w-full flex items-center justify-between p-4 active:bg-card-main transition-colors">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-text-main/40" />
                <span>Version de l'application</span>
              </div>
              <span className="text-text-main/30 text-sm">2.0.0</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 active:bg-card-main transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-text-main/40" />
                <span>Confidentialité</span>
              </div>
            </button>
          </div>
        </section>

        <button className="w-full bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/20 flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>

      <ConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => !isResetting && setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Hamafa ve ?"
        message="Voulez-vous vraiment réinitialiser les données Lohahevitra ? Cela supprimera toutes les données locales et relancera une synchronisation."
        confirmText={isResetting ? 'Fafana...' : 'Eny'}
        cancelText="Annuler"
        isDestructive
      />

      <ErrorModal
        isOpen={!!errorInfo}
        onClose={() => setErrorInfo(null)}
        title={errorInfo?.title || ''}
        message={errorInfo?.message || ''}
        type={errorInfo?.type}
        onRetry={errorInfo?.type === 'connection' ? handleSync : undefined}
      />
    </div>
  );
}
