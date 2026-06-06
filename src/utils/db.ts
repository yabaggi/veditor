import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

export interface Project {
  id?: number;
  title: string;
  videoBlob: Blob;
  videoName: string;
  createdAt: number;
}

export interface Snap {
  id?: number;
  projectId: number;
  dataUrl: string;
  timestamp: number;
  caption?: string;
  createdAt: number;
}

export interface ExportedFile {
  id?: number;
  projectId: number;
  name: string;
  type: 'gif' | 'html' | 'md';
  blob: Blob;
  createdAt: number;
}

const DB_NAME = 'veditor-projects-db-v2';
const PROJECTS_STORE = 'projects';
const SNAPS_STORE = 'snaps';
const EXPORTS_STORE = 'exports';

let dbPromise: Promise<IDBPDatabase>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        // Projects Store
        if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
          db.createObjectStore(PROJECTS_STORE, { keyPath: 'id', autoIncrement: true });
        }
        
        // Snaps Store
        if (!db.objectStoreNames.contains(SNAPS_STORE)) {
          const snapsStore = db.createObjectStore(SNAPS_STORE, { keyPath: 'id', autoIncrement: true });
          snapsStore.createIndex('projectId', 'projectId');
        }
        
        // Exports Store
        if (!db.objectStoreNames.contains(EXPORTS_STORE)) {
          const exportsStore = db.createObjectStore(EXPORTS_STORE, { keyPath: 'id', autoIncrement: true });
          exportsStore.createIndex('projectId', 'projectId');
        }
      },
    });
  }
  return dbPromise;
};

// Project Operations
export const saveProject = async (project: Omit<Project, 'id'>) => {
  const db = await initDB();
  return db.add(PROJECTS_STORE, project);
};

export const getProjects = async (): Promise<Project[]> => {
  const db = await initDB();
  return db.getAll(PROJECTS_STORE);
};

export const getProject = async (id: number): Promise<Project | undefined> => {
  const db = await initDB();
  return db.get(PROJECTS_STORE, id);
};

export const deleteProject = async (id: number) => {
  const db = await initDB();
  const tx = db.transaction([PROJECTS_STORE, SNAPS_STORE, EXPORTS_STORE], 'readwrite');
  await tx.objectStore(PROJECTS_STORE).delete(id);
  
  // Cleanup snaps
  const snapsStore = tx.objectStore(SNAPS_STORE);
  const snapKeys = await snapsStore.index('projectId').getAllKeys(id);
  for (const key of snapKeys) await snapsStore.delete(key);
  
  // Cleanup exports
  const exportsStore = tx.objectStore(EXPORTS_STORE);
  const exportKeys = await exportsStore.index('projectId').getAllKeys(id);
  for (const key of exportKeys) await exportsStore.delete(key);
  
  await tx.done;
};

// Snap Operations
export const saveSnapToDb = async (snap: Omit<Snap, 'id'>) => {
  const db = await initDB();
  return db.add(SNAPS_STORE, snap);
};

export const getSnapsByProject = async (projectId: number): Promise<Snap[]> => {
  const db = await initDB();
  return db.getAllFromIndex(SNAPS_STORE, 'projectId', projectId);
};

export const deleteSnapFromDb = async (id: number) => {
  const db = await initDB();
  return db.delete(SNAPS_STORE, id);
};

export const updateSnapInDb = async (snap: Snap) => {
  const db = await initDB();
  return db.put(SNAPS_STORE, snap);
};

// Export Operations
export const saveExportToDb = async (file: Omit<ExportedFile, 'id'>) => {
  const db = await initDB();
  return db.add(EXPORTS_STORE, file);
};

export const getExportsByProject = async (projectId: number): Promise<ExportedFile[]> => {
  const db = await initDB();
  return db.getAllFromIndex(EXPORTS_STORE, 'projectId', projectId);
};

export const deleteExportFromDb = async (id: number) => {
  const db = await initDB();
  return db.delete(EXPORTS_STORE, id);
};
