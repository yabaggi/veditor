import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProjects, getProject, saveProject, deleteProject, type Project } from '../utils/db';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  loading: boolean;
  createProject: (title: string, videoBlob: Blob, videoName: string) => Promise<number>;
  selectProject: (id: number | null) => Promise<void>;
  removeProject: (id: number) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    setLoading(true);
    const data = await getProjects();
    setProjects(data.sort((a, b) => b.createdAt - a.createdAt));
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const createProject = async (title: string, videoBlob: Blob, videoName: string) => {
    const id = await saveProject({
      title,
      videoBlob,
      videoName,
      createdAt: Date.now(),
    });
    await refreshProjects();
    return id as number;
  };

  const selectProject = async (id: number | null) => {
    if (id === null) {
      setActiveProject(null);
      return;
    }
    const project = await getProject(id);
    if (project) {
      setActiveProject(project);
    }
  };

  const removeProject = async (id: number) => {
    await deleteProject(id);
    if (activeProject?.id === id) {
      setActiveProject(null);
    }
    await refreshProjects();
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      activeProject, 
      loading, 
      createProject, 
      selectProject, 
      removeProject, 
      refreshProjects 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
