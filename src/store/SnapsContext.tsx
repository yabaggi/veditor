import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSnapsByProject, saveSnapToDb, deleteSnapFromDb, updateSnapInDb } from '../utils/db';
import type { Snap } from '../utils/db';
import { useProject } from './ProjectContext';

interface SnapsContextType {
  snaps: Snap[];
  loading: boolean;
  addSnap: (snap: Omit<Snap, 'projectId' | 'id'>) => Promise<void>;
  removeSnap: (id: number) => Promise<void>;
  removeAllSnaps: () => Promise<void>;
  editSnap: (snap: Snap) => Promise<void>;
  refreshSnaps: () => Promise<void>;
}

const SnapsContext = createContext<SnapsContextType | undefined>(undefined);

export const SnapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeProject } = useProject();
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSnaps = useCallback(async () => {
    if (!activeProject?.id) {
      setSnaps([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getSnapsByProject(activeProject.id);
      setSnaps(data.sort((a, b) => a.timestamp - b.timestamp));
    } catch (err) {
      console.error('Failed to fetch snaps:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProject?.id]);

  useEffect(() => {
    refreshSnaps();
  }, [refreshSnaps]);

  const addSnap = async (snap: Omit<Snap, 'projectId' | 'id'>) => {
    if (!activeProject?.id) return;
    await saveSnapToDb({ ...snap, projectId: activeProject.id });
    await refreshSnaps();
  };

  const removeSnap = async (id: number) => {
    await deleteSnapFromDb(id);
    await refreshSnaps();
  };

  const removeAllSnaps = async () => {
    // Manually delete each for now, or add clearByProject to db.ts
    for (const snap of snaps) {
      if (snap.id) await deleteSnapFromDb(snap.id);
    }
    await refreshSnaps();
  };

  const editSnap = async (snap: Snap) => {
    await updateSnapInDb(snap);
    await refreshSnaps();
  };

  return (
    <SnapsContext.Provider value={{ 
      snaps, 
      loading, 
      addSnap, 
      removeSnap, 
      removeAllSnaps, 
      editSnap, 
      refreshSnaps 
    }}>
      {children}
    </SnapsContext.Provider>
  );
};

export const useSnapsContext = () => {
  const context = useContext(SnapsContext);
  if (!context) {
    throw new Error('useSnapsContext must be used within a SnapsProvider');
  }
  return context;
};
