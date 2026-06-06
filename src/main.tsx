import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { SnapsProvider } from './store/SnapsContext';
import { ProjectProvider } from './store/ProjectContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProjectProvider>
      <SnapsProvider>
        <App />
      </SnapsProvider>
    </ProjectProvider>
  </React.StrictMode>
);
