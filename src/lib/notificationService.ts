import { db } from './db';
import { isAfter, isBefore, addDays, startOfDay, parseISO } from 'date-fns';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export async function requestNotificationPermission() {
  if (isNative) {
    try {
      const status = await LocalNotifications.requestPermissions();
      if (status.display === 'granted') {
        showNotification('Fampandrenesana mavitrika!', 'Hahazo fampandrenesana ianao rehefa misy hetsika manakaiky.');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting Capacitor notification permission:', error);
      return false;
    }
  }

  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    try {
      let resolved = false;
      const handlePermission = (permission: NotificationPermission) => {
        if (resolved) return;
        resolved = true;
        if (permission === 'granted') {
          showNotification('Fampandrenesana mavitrika!', 'Hahazo fampandrenesana ianao rehefa misy hetsika manakaiky.');
        }
        resolve(permission === 'granted');
      };

      // Try the modern Promise-based API
      const promise = Notification.requestPermission(handlePermission);
      if (promise && typeof promise.then === 'function') {
        promise.then(handlePermission).catch((err) => {
          console.error('Notification promise error:', err);
          // If promise fails, we might still get the callback
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      resolve(false);
    }
  });
}

export async function checkUpcomingReminders() {
  if (isNative) {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') return;
  } else {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
  }

  const now = new Date();
  const tomorrow = startOfDay(addDays(now, 1));
  const nextWeek = startOfDay(addDays(now, 7));

  // Check Events
  const events = await db.evenement.toArray();
  for (const event of events) {
    const startDate = parseISO(event.date_debut);
    const eventId = `event_${event.idevenement}`;
    
    // Check if we already notified for this event today
    const lastNotified = localStorage.getItem(`notified_${eventId}`);
    const todayStr = startOfDay(now).toISOString();
    if (lastNotified === todayStr) continue;

    if (startOfDay(startDate).getTime() === tomorrow.getTime()) {
      showNotification('Hetsika rahampitso!', `Aza adino: ${event.nom} dia hatao rahampitso.`);
      localStorage.setItem(`notified_${eventId}`, todayStr);
    } else if (startOfDay(startDate).getTime() === nextWeek.getTime()) {
      showNotification('Hetsika amin\'ny herinandro!', `Hetsika lehibe: ${event.nom} amin'ny herinandro ho avy.`);
      localStorage.setItem(`notified_${eventId}`, todayStr);
    }
  }

  // Check Mpamaky Teny (Bible reading turns)
  const allThemes = await db.lohahevitra.toArray();
  const allProgs = await db.lohahevitra_programme.toArray();
  
  // Find which themes have assigned members
  const themesWithProgs = new Set(allProgs.map(p => String(p.idlohahevitra)));
  
  for (const theme of allThemes) {
    if (!themesWithProgs.has(String(theme.idlohahevitra))) continue;

    // We use strict matching because date comes with weird TZ
    const m = theme.date.match(/(\d{4})[-/.](\d{2})[-/.](\d{2})/);
    if (!m) continue;
    const themeTargetDate = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
    
    // Check if it's within the next 7 days, e.g., the upcoming Sunday
    const daysUntil = (startOfDay(themeTargetDate).getTime() - startOfDay(now).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysUntil >= 0 && daysUntil <= 6) { // It's coming up this week!
      const mpamakyId = `mpamaky_teny_${theme.idlohahevitra}`;
      const lastNotified = localStorage.getItem(`notified_${mpamakyId}`);
      const weekStr = `${now.getFullYear()}_${now.getMonth()}_week_${Math.floor(now.getDate() / 7)}`;
      
      // Warn once per week per event to avoid spamming everyday
      if (lastNotified !== weekStr) {
        showNotification('Anjara Mpamaky Teny!', `Aza adinoina fa ny Alahady izao dia anjarantsika (Shalom) ny mamaky ny Tenin'Andriamanitra sy mivavaka.`);
        localStorage.setItem(`notified_${mpamakyId}`, weekStr);
      }
    }
  }

  // Check Projects
  const projects = await db.projet.toArray();
  for (const project of projects) {
    const startDate = parseISO(project.date_debut);
    const projectId = `project_${project.idprojet}`;
    
    const lastNotified = localStorage.getItem(`notified_${projectId}`);
    const todayStr = startOfDay(now).toISOString();
    if (lastNotified === todayStr) continue;

    if (startOfDay(startDate).getTime() === tomorrow.getTime()) {
      showNotification('Tetikasa rahampitso!', `Hanomboka rahampitso ny tetikasa: ${project.nom}.`);
      localStorage.setItem(`notified_${projectId}`, todayStr);
    } else if (startOfDay(startDate).getTime() === nextWeek.getTime()) {
      showNotification('Tetikasa amin\'ny herinandro!', `Tetikasa vaovao: ${project.nom} amin'ny herinandro ho avy.`);
      localStorage.setItem(`notified_${projectId}`, todayStr);
    }
  }
}

async function showNotification(title: string, body: string) {
  if (isNative) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 1000000),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            attachments: [],
            actionTypeId: '',
            extra: null
          }
        ]
      });
      return;
    } catch (error) {
      console.error('Error showing Capacitor notification:', error);
    }
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  const options: any = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: title,
    renotify: true,
    vibrate: [100, 50, 100]
  };

  try {
    // Try via Service Worker first (better for mobile/PWA)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return;
      }
    }
    
    // Fallback to standard Notification API
    new Notification(title, options);
  } catch (error) {
    console.error('Error showing notification:', error);
    // Final fallback
    try {
      new Notification(title, options);
    } catch (e) {
      console.error('Final notification fallback failed:', e);
    }
  }
}
