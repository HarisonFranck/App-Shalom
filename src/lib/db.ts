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
  password?: string;
}

export interface Genre {
  idgenre: string;
  nom: string;
}

export interface Feo {
  idfeo: string;
  nom: string;
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

export interface ProgrammeType {
  id: number;
  code: string;
  libelle: string;
  created_at: string;
}

export interface LohahevitraProgramme {
  id: string;
  idlohahevitra: string;
  idprogramme_type: number;
  idverset?: string;
  idmembre: string;
  ordre?: number;
  libelle_personnalise?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export class ShalomDatabase extends Dexie {
  tononkira!: Table<Tononkira>;
  evenement!: Table<Evenement>;
  projet!: Table<Projet>;
  membre!: Table<Membre>;
  genre!: Table<Genre>;
  feo!: Table<Feo>;
  lohahevitra!: Table<Lohahevitra>;
  tononkiraako!: Table<Tononkiraako>;
  tononkiratiana!: Table<Tononkiratiana>;
  verset!: Table<Verset>;
  lohahevitra_verset!: Table<LohahevitraVerset>;
  lohahevitravolana!: Table<LohahevitraVolana>;
  programme_type!: Table<ProgrammeType>;
  lohahevitra_programme!: Table<LohahevitraProgramme>;
  syncLogs!: Table<SyncLog>;

  constructor() {
    super('ShalomDatabaseV2');
    this.version(1).stores({
      tononkira: 'idtononkira, titre, mpihira, tiana',
      evenement: 'idevenement, nom, date_debut',
      projet: 'idprojet, nom, date_debut',
      membre: 'idmembre, nom, prenom, idgenre, idfeo',
      genre: 'idgenre, nom',
      feo: 'idfeo, nom',
      lohahevitra: 'idlohahevitra, nom, date, idlohahevitravolana',
      tononkiraako: '++id, titre, mpihira',
      tononkiratiana: '++id, titre, mpihira, idtononkira',
      verset: 'idverset',
      lohahevitra_verset: '[idlohahevitra+idverset+type], idlohahevitra, idverset, type',
      lohahevitravolana: 'id',
      syncLogs: '++id, tableName'
    });
    this.version(2).stores({
      programme_type: 'id, code',
      lohahevitra_programme: 'id, idlohahevitra, idprogramme_type, idmembre'
    });
  }
}

export const db = new ShalomDatabase();
