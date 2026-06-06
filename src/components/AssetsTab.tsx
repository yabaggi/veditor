import React, { useState, useEffect, useCallback } from 'react';
import { getExportsByProject, deleteExportFromDb, type ExportedFile } from '../utils/db';
import { useProject } from '../store/ProjectContext';
import JSZip from 'jszip';
import AssetPreview from './AssetPreview';

const AssetsTab: React.FC = () => {
  const { activeProject } = useProject();
  const [exports, setExports] = useState<ExportedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  
  // Preview state
  const [previewData, setPreviewData] = useState<{ name: string, type: 'html' | 'md' | 'gif', content: string } | null>(null);

  const refreshAssets = useCallback(async () => {
    if (!activeProject?.id) return;
    setLoading(true);
    const data = await getExportsByProject(activeProject.id);
    setExports(data.sort((a, b) => b.createdAt - a.createdAt));
    setLoading(false);
  }, [activeProject?.id]);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  // Enhanced download/share helper for individual files
  const handleAssetAction = async (asset: ExportedFile) => {
    const file = new File([asset.blob], asset.name, { type: asset.blob.type });

    // Try Native Share first (Better for Android/Mobile)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: asset.name,
        });
        return;
      } catch (err) {
        console.log('Share failed, falling back to download', err);
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: Traditional Download
    const url = URL.createObjectURL(asset.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = asset.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 15000);
  };

  const downloadProjectZip = async () => {
    if (exports.length === 0 || isZipping || !activeProject) return;
    
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderName = activeProject.title.replace(/\s+/g, '_');
      
      // Add all exports to the ZIP
      for (const asset of exports) {
        zip.file(asset.name, asset.blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}_assets.zip`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 15000);
    } catch (err) {
      console.error('ZIP failed:', err);
      alert('Failed to create ZIP bundle.');
    } finally {
      setIsZipping(false);
    }
  };

  const removeAsset = async (id: number) => {
    await deleteExportFromDb(id);
    await refreshAssets();
  };

  const handlePreview = async (asset: ExportedFile) => {
    if (asset.type === 'gif') {
      const url = URL.createObjectURL(asset.blob);
      setPreviewData({ name: asset.name, type: 'gif', content: url });
    } else {
      const text = await asset.blob.text();
      setPreviewData({ name: asset.name, type: asset.type as any, content: text });
    }
  };

  if (loading) return <div>Loading folder assets...</div>;

  return (
    <div className="assets-tab">
      {previewData && (
        <AssetPreview 
          name={previewData.name} 
          type={previewData.type} 
          content={previewData.content} 
          onClose={() => {
            if (previewData.type === 'gif') URL.revokeObjectURL(previewData.content);
            setPreviewData(null);
          }} 
        />
      )}

      <div className="asset-group">
        <div className="group-header">
          <h3>📂 Folder Contents</h3>
          {exports.length > 0 && (
            <button 
              className="save-all-btn" 
              onClick={downloadProjectZip}
              disabled={isZipping}
            >
              {isZipping ? 'Bundling ZIP...' : 'Download All as ZIP'}
            </button>
          )}
        </div>
        
        <div className="asset-list">
          <div className="asset-card source">
            <div className="asset-icon">🎬</div>
            <div className="asset-info">
              <span className="type-badge source">ORIGINAL VIDEO</span>
              <p>{activeProject?.videoName}</p>
              <span>{activeProject ? (activeProject.videoBlob.size / (1024 * 1024)).toFixed(2) : 0} MB</span>
            </div>
            <div className="asset-note">Already on your phone</div>
          </div>

          {exports.length === 0 && (
            <div className="empty-assets">
              <p>No exports created yet. Snaps and Trims will appear here as files.</p>
            </div>
          )}
          
          {exports.map(asset => (
            <div key={asset.id} className="asset-card">
              <div className="asset-icon">
                {asset.type === 'gif' ? '🎞️' : asset.type === 'html' ? '📄' : '📝'}
              </div>
              <div className="asset-info">
                <span className={`type-badge ${asset.type}`}>{asset.type.toUpperCase()}</span>
                <p>{asset.name}</p>
                <span>{new Date(asset.createdAt).toLocaleString()} • {(asset.blob.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="asset-actions">
                <button className="preview-btn" onClick={() => handlePreview(asset)}>Preview</button>
                <button className="download-btn" onClick={() => handleAssetAction(asset)}>
                  Save/Share
                </button>
                <button className="delete-btn" onClick={() => removeAsset(asset.id!)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .assets-tab { margin-top: 10px; padding-bottom: 40px; }
        .group-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border-bottom: 1px solid #333; 
          margin-bottom: 16px; 
          padding-bottom: 8px; 
        }
        .group-header h3 { margin: 0; font-size: 16px; color: #aaa; }
        .save-all-btn { 
          background: #34c759; 
          font-size: 11px; 
          padding: 8px 14px; 
          color: white; 
          border-radius: 6px;
          font-weight: bold;
          border: none;
        }
        .save-all-btn:disabled { opacity: 0.6; }
        .asset-list { display: flex; flex-direction: column; gap: 8px; }
        .asset-card { 
          background: #1e1e1e; 
          border: 1px solid #333; 
          padding: 12px; 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          gap: 12px;
        }
        .asset-card.source { border-left: 4px solid #555; }
        .asset-icon { font-size: 24px; min-width: 32px; text-align: center; }
        .asset-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .asset-info p { margin: 0; font-size: 13px; font-weight: 500; color: #eee; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .asset-info span { font-size: 10px; color: #666; }
        .asset-note { font-size: 10px; color: #555; font-style: italic; }
        .type-badge { font-size: 9px; padding: 2px 6px; border-radius: 4px; width: fit-content; font-weight: bold; margin-bottom: 2px; }
        .type-badge.source { background: #333; color: #888; }
        .type-badge.gif { background: #5856d6; color: white; }
        .type-badge.html { background: #ff9500; color: white; }
        .type-badge.md { background: #007aff; color: white; }
        .asset-actions { display: flex; gap: 6px; }
        .preview-btn { background: #444; color: white; font-size: 11px; padding: 6px 8px; border: none; border-radius: 4px; }
        .download-btn { background: #333; color: #34c759; border: 1px solid #34c759; font-size: 11px; padding: 6px 8px; font-weight: 600; }
        .delete-btn { background: none; color: #555; font-size: 11px; padding: 6px 8px; border: none; }
        .empty-assets { text-align: center; color: #555; padding: 40px; font-size: 13px; font-style: italic; }
      `}</style>
    </div>
  );
};

export default AssetsTab;
