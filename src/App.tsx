import React, { useState } from 'react';
import ProjectGallery from './components/ProjectGallery';
import VideoSection from './components/VideoSection';
import SnapSection from './components/SnapSection';
import TrimSection from './components/TrimSection';
import AssetsTab from './components/AssetsTab';
import { useProject } from './store/ProjectContext';

const AppContent: React.FC = () => {
  const { activeProject, selectProject } = useProject();
  const [activeTab, setActiveTab] = useState<'snaps' | 'trim' | 'assets'>('snaps');

  if (!activeProject) {
    return <ProjectGallery />;
  }

  return (
    <div className="project-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => selectProject(null)}>← Folders</button>
        <h2>{activeProject.title}</h2>
      </div>

      <nav className="tabs">
        <button 
          className={activeTab === 'snaps' ? 'active' : ''} 
          onClick={() => setActiveTab('snaps')}
        >
          Snaps
        </button>
        <button 
          className={activeTab === 'trim' ? 'active' : ''} 
          onClick={() => setActiveTab('trim')}
        >
          Trim
        </button>
        <button 
          className={activeTab === 'assets' ? 'active' : ''} 
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'snaps' && (
          <>
            <VideoSection videoFile={activeProject.videoBlob as File} onVideoSelect={() => {}} mode="snaps" />
            <SnapSection />
          </>
        )}
        {activeTab === 'trim' && <TrimSection videoFile={activeProject.videoBlob as File} />}
        {activeTab === 'assets' && <AssetsTab />}
      </div>

      <style>{`
        .project-view { margin-top: 10px; }
        .view-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .back-btn { background: #333; font-size: 12px; padding: 6px 12px; }
        .view-header h2 { margin: 0; font-size: 1.2rem; }
        .tabs { display: flex; gap: 10px; border-bottom: 1px solid var(--border-color); margin-bottom: 16px; }
        .tabs button { background: none; color: #aaa; border-radius: 0; padding: 8px 16px; font-weight: bold; }
        .tabs button.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="container">
      <header>
        <h1>Veditor</h1>
        <div className="app-explanation">
          <p>
            <strong>Project Folders:</strong> Due to browser security, we create virtual "Folders" 
            within the app. Each folder keeps your original video, captured snaps, and exports 
            private and organized on your device.
          </p>
        </div>
      </header>
      <main>
        <AppContent />
      </main>
      <style>{`
        .app-explanation {
          background: #1a1a1a;
          border-left: 4px solid var(--primary-color);
          padding: 12px;
          margin: 10px 0 20px 0;
          font-size: 13px;
          line-height: 1.4;
          color: #ccc;
          border-radius: 4px;
        }
        .app-explanation p { margin: 0; }
        .app-explanation strong { color: var(--primary-color); }
      `}</style>
    </div>
  );
};

export default App;
