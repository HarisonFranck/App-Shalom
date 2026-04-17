import { supabase, isSupabaseConfigured } from './supabase';
import { db } from './db';

const TABLES_TO_SYNC = [
  { name: 'tononkira', pk: 'idtononkira' },
  { name: 'evenement', pk: 'idevenement' },
  { name: 'projet', pk: 'idprojet' },
  { name: 'membre', pk: 'idmembre' },
  { name: 'genre', pk: 'idgenre' },
  { name: 'feo', pk: 'idfeo' },
  { name: 'lohahevitra', pk: 'idlohahevitra' },
  { name: 'verset', pk: 'idverset' },
  { name: 'lohahevitra_verset', pk: ['idlohahevitra', 'idverset'] },
  { name: 'lohahevitravolana', pk: 'id' },
  { name: 'programme_type', pk: 'id' },
  { name: 'lohahevitra_programme', pk: 'id' }
];

export async function syncData() {
  if (!isSupabaseConfigured) {
    console.log('Supabase is not configured. Skipping sync.');
    return;
  }

  console.log('Starting sync...');
  
  if (!navigator.onLine) {
    throw new Error('Tsy misy fifandraisana internet. Mba jereo ny data na ny wifi anao.');
  }

  for (const table of TABLES_TO_SYNC) {
    try {
      // Get last sync time for this table
      const log = await db.syncLogs.where('tableName').equals(table.name).first();
      const lastSync = log ? new Date(log.lastSyncAt).toISOString() : new Date(0).toISOString();

      // Fetch from Supabase
      let query = supabase.from(table.name).select('*');
      
      // Only apply updated_at filter if it's not the first sync
      // and we have a valid lastSync date
      if (log && log.lastSyncAt > 0) {
        query = query.gt('updated_at', lastSync);
      }

      const { data: initialData, error: initialError } = await query;
      let data = initialData;

      if (initialError) {
        // Rendre la détection plus flexible pour accepter "column updated_at does not exist" 
        // ou "column verset.updated_at does not exist", etc.
        const isMissingColumnError = 
          initialError.message?.includes('updated_at') && 
          initialError.message?.includes('does not exist');

        if (isMissingColumnError) {
          console.warn(`Table ${table.name} doesn't have updated_at, performing full sync.`);
          const { data: fullData, error: fullError } = await supabase.from(table.name).select('*');
          if (fullError) throw fullError;
          data = fullData;
        } else {
          throw initialError;
        }
      }

      if (data && data.length > 0) {
        console.log(`Syncing ${data.length} records for ${table.name}`);
        // Upsert into Dexie
        try {
          await db.table(table.name).bulkPut(data);
        } catch (dbErr) {
          console.error(`Database error during bulkPut for ${table.name}:`, dbErr);
          // If bulkPut fails, try individual puts to isolate the issue
          for (const item of data) {
            try {
              await db.table(table.name).put(item);
            } catch (singleErr) {
              console.error(`Failed to put single item in ${table.name}:`, item, singleErr);
            }
          }
        }
        
        // Update sync log
        const now = Date.now();
        if (log) {
          await db.syncLogs.update(log.id!, { lastSyncAt: now });
        } else {
          await db.syncLogs.add({ tableName: table.name, lastSyncAt: now });
        }
      }
    } catch (err: any) {
      console.error(`Error syncing ${table.name}:`, err);
      if (err.message?.includes('Failed to fetch') || err.status === 0) {
        throw new Error('Tsy afaka nifandray tamin\'ny server. Mety ho lany ny data na ratsy ny fifandraisana.');
      }
      throw err;
    }
  }
  
  // Update global sync log
  const now = Date.now();
  const globalLog = await db.syncLogs.where('tableName').equals('global_sync').first();
  if (globalLog) {
    await db.syncLogs.update(globalLog.id!, { lastSyncAt: now });
  } else {
    await db.syncLogs.add({ tableName: 'global_sync', lastSyncAt: now });
  }
  
  console.log('Sync complete.');
}

export async function resetLohahevitra() {
  if (!isSupabaseConfigured) {
    console.log('Supabase is not configured. Skipping reset sync.');
    return;
  }

  if (!navigator.onLine) {
    throw new Error('Tsy misy fifandraisana internet. Mba jereo ny data na ny wifi anao alohan\'ny hamerenana ny angon-drakitra.');
  }

  try {
    console.log('Resetting Lohahevitra data...');
    const tablesToClear = ['lohahevitra', 'lohahevitra_verset', 'lohahevitravolana', 'verset', 'programme_type', 'lohahevitra_programme'];
    
    const tables = tablesToClear.map(t => db.table(t));
    await db.transaction('rw', [db.syncLogs, ...tables], async () => {
      for (const tableName of tablesToClear) {
        console.log(`Clearing table: ${tableName}`);
        await db.table(tableName).clear();
        await db.syncLogs.where('tableName').equals(tableName).delete();
      }
      
      // Update last reset log
      const now = Date.now();
      const resetLog = await db.syncLogs.where('tableName').equals('last_reset').first();
      if (resetLog) {
        await db.syncLogs.update(resetLog.id!, { lastSyncAt: now });
      } else {
        await db.syncLogs.add({ tableName: 'last_reset', lastSyncAt: now });
      }
    });
    
    console.log('Reset complete. Starting fresh sync...');
    await syncData();
    console.log('Fresh sync after reset complete.');
  } catch (error: any) {
    console.error('Error during resetLohahevitra:', error);
    if (error.message?.includes('Failed to fetch') || error.status === 0) {
      throw new Error('Tsy afaka nifandray tamin\'ny server. Mety ho lany ny data na ratsy ny fifandraisana.');
    }
    throw error;
  }
}
