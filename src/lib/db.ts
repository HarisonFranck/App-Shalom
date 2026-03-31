import Dexie, { type Table } from 'dexie';

export interface Tononkira {
  idtononkira: string;
  created_at: string;
  updated_at: string;
  titre: string;
  mpihira: string;
  tonony: string;
  tiana: boolean;
}

export interface Evenement {
  idevenement: string;
  created_at: string;
  updated_at: string;
  nom: string;
  description: string;
  date_debut: string;
  date_fin: string;
  image: string;
  participant: string;
  lieu: string;
}

export interface Projet {
  idprojet: string;
  created_at: string;
  updated_at: string;
  nom: string;
  description: string;
  date_debut: string;
  date_fin: string;
  image: string;
  participant: string;
}

export interface Membre {
  idmembre: string;
  created_at: string;
  updated_at: string;
  nom: string;
  prenom: string;
  date_de_naissance: string;
  idgenre: string;
  idfeo: string;
  telephone: string;
  image: string;
}

export interface Lohahevitra {
  idlohahevitra: string;
  created_at: string;
  updated_at: string;
  date: string;
  nom: string;
  idlohahevitravolana: string;
  andro: string;
}

export interface SyncLog {
  id?: number;
  tableName: string;
  lastSyncAt: number;
}

export interface Tononkiraako {
  id?: number;
  created_at: string;
  titre: string;
  mpihira: string;
  tonony: string;
}

export interface Verset {
  idverset: string;
  verset: string;
  parole: string;
}

export interface LohahevitraVerset {
  idlohahevitra: string;
  idverset: string;
  type: string;
}

export interface LohahevitraVolana {
  id: string;
  created_at: string;
  lohahevitra: string;
  volana: string;
}

export interface Tononkiratiana {
  id?: number;
  created_at: string;
  titre: string;
  mpihira: string;
  idtononkira?: string | number;
  tonony: string;
}

export class ShalomDatabase extends Dexie {
  tononkira!: Table<Tononkira>;
  evenement!: Table<Evenement>;
  projet!: Table<Projet>;
  membre!: Table<Membre>;
  lohahevitra!: Table<Lohahevitra>;
  tononkiraako!: Table<Tononkiraako>;
  tononkiratiana!: Table<Tononkiratiana>;
  verset!: Table<Verset>;
  lohahevitra_verset!: Table<LohahevitraVerset>;
  lohahevitravolana!: Table<LohahevitraVolana>;
  syncLogs!: Table<SyncLog>;

  constructor() {
    super('ShalomDatabaseV2');
    this.version(1).stores({
      tononkira: 'idtononkira, titre, mpihira, tiana',
      evenement: 'idevenement, nom, date_debut',
      projet: 'idprojet, nom, date_debut',
      membre: 'idmembre, nom, prenom',
      lohahevitra: 'idlohahevitra, nom, date, idlohahevitravolana',
      tononkiraako: '++id, titre, mpihira',
      tononkiratiana: '++id, titre, mpihira, idtononkira',
      verset: 'idverset',
      lohahevitra_verset: '[idlohahevitra+idverset+type], idlohahevitra, idverset, type',
      lohahevitravolana: 'id',
      syncLogs: '++id, tableName'
    });
  }
}

export const db = new ShalomDatabase();
