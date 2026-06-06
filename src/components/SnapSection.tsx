import React, { useState } from 'react';
import SnapItem from './SnapItem';
import { useSnaps } from '../hooks/useSnaps';
import { generateGif } from '../utils/gif';
import { generateHtmlExport } from '../utils/export';
import { saveExportToDb, getSnapsByProject } from '../utils/db';
import { useProject } from '../store/ProjectContext';

const SnapSection: React.FC = () => {
  const { snaps, loading, removeSnap, removeAllSnaps, editSnap } = useSnaps();
  const { activeProject } = useProject();
  const [isExporting, setIsExporting] = useState(false);

  const handleShareExport = async () => {
    if (snaps.length === 0 || !activeProject?.id) return;
    
    // Fetch latest snaps from DB to ensure captions are included (in case of onBlur race)
    const latestSnaps = await getSnapsByProject(activeProject.id);
    const sortedSnaps = latestSnaps.sort((a, b) => a.timestamp - b.timestamp);

    const defaultTitle = activeProject.title || "Step by step guide";
    const titleInput = prompt("Enter a title for your guide:", defaultTitle);
    
    if (titleInput === null) return; // User cancelled
    
    const title = titleInput || defaultTitle;
    
    // HTML Export
    const htmlContent = generateHtmlExport(title, sortedSnaps);
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    await saveExportToDb({
      projectId: activeProject.id,
      name: `${title}.html`,
      type: 'html',
      blob: htmlBlob,
      createdAt: Date.now()
    });

    alert('HTML Report saved to Assets tab!');
  };

  const handleExportGif = async () => {
    if (snaps.length === 0 || !activeProject?.id) return;
    
    setIsExporting(true);
    try {
      const img = new Image();
      img.src = snaps[0].dataUrl;
      await new Promise(r => img.onload = r);

      const blob = await generateGif(snaps, {
        width: img.width || 640,
        height: img.height || 360,
        delay: 500,
        quality: 10
      });

      await saveExportToDb({
        projectId: activeProject.id,
        name: `export-${Date.now()}.gif`,
        type: 'gif',
        blob,
        createdAt: Date.now()
      });

      alert('GIF saved to Assets tab!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate GIF');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading && snaps.length === 0) return <p>Loading snaps...</p>;

  return (
    <section className="snap-section">
      <div className="header">
        <h3>Snaps ({snaps.length})</h3>
        <div className="actions">
          {snaps.length > 0 && (
            <>
              <button className="share-btn" onClick={handleShareExport}>
                Export HTML
              </button>
              <button className="export-btn" onClick={handleExportGif} disabled={isExporting}>
                {isExporting ? 'Exporting...' : 'Export GIF'}
              </button>
              <button className="clear-btn" onClick={removeAllSnaps}>Clear All</button>
            </>
          )}
        </div>
      </div>

      <div className="snap-grid">
        {snaps.map((snap) => (
          <SnapItem
            key={snap.id}
            snap={snap}
            onDelete={removeSnap}
            onEdit={editSnap}
          />
        ))}
      </div>

      <style>{`
        .snap-section {
          margin-top: 24px;
          padding-bottom: 40px;
        }
        .snap-section .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        .clear-btn {
          background-color: #444;
          font-size: 11px;
          padding: 6px 10px;
        }
        .export-btn {
          background-color: #34c759;
          font-size: 11px;
          padding: 6px 10px;
        }
        .share-btn {
          background-color: #007aff;
          font-size: 11px;
          padding: 6px 10px;
        }
        .snap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }
        @media (max-width: 480px) {
          .snap-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
};

export default SnapSection;
