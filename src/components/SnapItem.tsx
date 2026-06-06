import React, { useState } from 'react';
import type { Snap } from '../utils/db';

interface SnapItemProps {
  snap: Snap;
  onDelete: (id: number) => void;
  onEdit: (snap: Snap) => void;
}

const SnapItem: React.FC<SnapItemProps> = ({ snap, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(snap.caption || '');

  // Sync local state if prop changes (e.g. from DB refresh)
  React.useEffect(() => {
    setCaption(snap.caption || '');
  }, [snap.caption]);

  const handleSave = () => {
    if (caption !== snap.caption) {
      onEdit({ ...snap, caption });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCaption(snap.caption || '');
      setIsEditing(false);
    }
  };

  return (
    <div className="snap-item">
      <img src={snap.dataUrl} alt={`Snap at ${snap.timestamp}s`} />
      <div className="snap-info">
        <span>{snap.timestamp.toFixed(2)}s</span>
        <button className="delete-btn" onClick={() => onDelete(snap.id!)}>×</button>
      </div>
      
      {isEditing ? (
        <div className="caption-edit">
          <input 
            value={caption} 
            onChange={(e) => setCaption(e.target.value)} 
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Add caption..."
            autoFocus
          />
          <button onMouseDown={(e) => e.preventDefault()} onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div className="caption-display" onClick={() => setIsEditing(true)}>
          {snap.caption || 'Add caption...'}
        </div>
      )}

      <style>{`
        .snap-item {
          position: relative;
          background: #333;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .snap-item img {
          width: 100%;
          display: block;
        }
        .snap-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          font-size: 10px;
          background: rgba(0,0,0,0.6);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }
        .delete-btn {
          background: none;
          color: #ff4d4d;
          padding: 0;
          font-size: 16px;
        }
        .caption-display {
          padding: 6px;
          font-size: 11px;
          background: #222;
          text-align: center;
          min-height: 28px;
          cursor: pointer;
          color: #ccc;
        }
        .caption-edit {
          display: flex;
          padding: 4px;
          background: #222;
        }
        .caption-edit input {
          flex: 1;
          background: #444;
          border: none;
          color: white;
          font-size: 11px;
          padding: 4px;
          border-radius: 4px;
        }
        .caption-edit button {
          font-size: 10px;
          padding: 4px 8px;
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
};

export default SnapItem;
