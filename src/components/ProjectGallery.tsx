import React, { useState } from 'react';
import { useProject } from '../store/ProjectContext';

const ProjectGallery: React.FC = () => {
  const { projects, loading, createProject, selectProject, removeProject } = useProject();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && videoFile) {
      const id = await createProject(title, videoFile, videoFile.name);
      await selectProject(id);
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="project-gallery">
      <div className="gallery-header">
        <h2>Your Project Folders</h2>
        <button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : 'New Folder'}
        </button>
      </div>

      {isCreating && (
        <form className="create-form" onSubmit={handleCreate}>
          <label>Folder Name:</label>
          <input 
            type="text" 
            placeholder="e.g., Recipe Guide" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label>Select Source Video:</label>
          <input 
            type="file" 
            accept="video/*" 
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            required
          />
          <button type="submit">Create Folder</button>
        </form>
      )}

      <div className="project-grid">
        {projects.length === 0 && !isCreating && (
          <p className="empty-msg">No project folders yet. Create one to get started!</p>
        )}
        {projects.map(project => (
          <div key={project.id} className="project-card" onClick={() => selectProject(project.id!)}>
            <div className="project-info">
              <h3>📁 {project.title}</h3>
              <p>{project.videoName}</p>
              <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <button 
              className="delete-btn" 
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this folder and all its contents?')) {
                  removeProject(project.id!);
                }
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .project-gallery { margin-top: 10px; }
        .gallery-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .create-form { background: #222; padding: 20px; border-radius: 12px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
        .create-form label { font-size: 12px; color: #aaa; margin-top: 4px; }
        .create-form input { padding: 10px; background: #333; border: 1px solid #444; color: white; border-radius: 8px; font-size: 14px; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .project-card { background: #1e1e1e; border: 1px solid #333; border-radius: 12px; padding: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
        .project-card:hover { border-color: var(--primary-color); background: #252525; }
        .project-info h3 { margin: 0 0 6px 0; color: white; font-size: 16px; }
        .project-info p { margin: 0; font-size: 12px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
        .project-info span { font-size: 10px; color: #555; }
        .delete-btn { background: #444; color: #ff4d4d; font-size: 11px; padding: 6px 10px; }
        .delete-btn:hover { background: #ff4d4d; color: white; }
        .empty-msg { text-align: center; color: #666; padding: 60px; font-style: italic; }
      `}</style>
    </div>
  );
};

export default ProjectGallery;
