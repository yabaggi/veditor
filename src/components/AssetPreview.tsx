import React from 'react';

interface AssetPreviewProps {
  name: string;
  type: 'html' | 'md' | 'gif';
  content: string; // The raw content for HTML/MD, or dataUrl for GIF
  onClose: () => void;
}

const AssetPreview: React.FC<AssetPreviewProps> = ({ name, type, content, onClose }) => {
  const renderContent = () => {
    if (type === 'html') {
      return (
        <iframe 
          title="HTML Preview" 
          srcDoc={content} 
          className="preview-iframe"
        />
      );
    }

    if (type === 'md') {
      // Basic MD to HTML converter for preview
      const html = content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" style="width:100%; border-radius:8px; margin:10px 0;" />')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/---/gim, '<hr />')
        .replace(/\n/gim, '<br />');

      return (
        <div 
          className="preview-markdown" 
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      );
    }

    if (type === 'gif') {
      return <img src={content} alt="GIF Preview" style={{ width: '100%', borderRadius: '8px' }} />;
    }

    return <p>Preview not available for this type.</p>;
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <div className="preview-header">
          <h3>{name}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="preview-body">
          {renderContent()}
        </div>
      </div>
      <style>{`
        .preview-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .preview-modal {
          background: #1e1e1e;
          width: 100%;
          max-width: 800px;
          height: 80vh;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .preview-header {
          padding: 16px;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .preview-header h3 { margin: 0; font-size: 16px; color: #eee; }
        .close-btn { background: none; font-size: 20px; color: #888; }
        .preview-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: white;
          color: #333;
        }
        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .preview-markdown {
          font-family: -apple-system, sans-serif;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default AssetPreview;
