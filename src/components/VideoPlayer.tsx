import React, { useRef, useState, useEffect } from 'react';
import TrimSlider from './TrimSlider';
import { useSnaps } from '../hooks/useSnaps';

interface VideoPlayerProps {
  src: string;
  onReset: () => void;
  mode: 'snaps' | 'trim';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onReset, mode }) => {
  const { addSnap } = useSnaps();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  
  // Auto-snap state
  const [isAutoSnap, setIsAutoSnap] = useState(false);
  const [autoSnapInterval, setAutoSnapInterval] = useState(5);
  const [isBatchCapturing, setIsBatchCapturing] = useState(false);

  useEffect(() => {
    if (duration > 0 && trimEnd === 0) {
      setTrimEnd(duration);
    }
  }, [duration]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (mode === 'trim') {
        if (time >= trimEnd) {
          videoRef.current.currentTime = trimStart;
          if (!isPlaying) videoRef.current.pause();
        }
        if (time < trimStart) {
          videoRef.current.currentTime = trimStart;
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setTrimEnd(videoRef.current.duration);
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const stepFrame = (direction: number) => {
    if (videoRef.current) videoRef.current.currentTime += direction * (1 / 30);
  };

  const captureSnap = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        await addSnap({
          dataUrl,
          timestamp: video.currentTime,
          createdAt: Date.now()
        });
      }
    }
  };

  const generateAllSnaps = async () => {
    if (!videoRef.current || isBatchCapturing) return;
    setIsBatchCapturing(true);
    const video = videoRef.current;
    const originalTime = video.currentTime;
    video.pause();

    try {
      // Snapping always on full duration as per new requirement
      for (let t = 0; t <= duration; t += autoSnapInterval) {
        video.currentTime = t;
        await new Promise((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve(null);
          };
          video.addEventListener('seeked', onSeeked);
        });
        await captureSnap();
      }
    } catch (err) {
      console.error('Batch capture failed:', err);
    } finally {
      video.currentTime = originalTime;
      setIsBatchCapturing(false);
    }
  };

  return (
    <div className="video-player">
      <div className="video-container">
        <video
          ref={videoRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          playsInline
        />
        {isBatchCapturing && <div className="batch-overlay">Generating Snaps...</div>}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="controls">
        {mode === 'trim' && (
          <TrimSlider
            duration={duration}
            start={trimStart}
            end={trimEnd}
            onChange={(s, e) => {
              setTrimStart(s);
              setTrimEnd(e);
            }}
          />
        )}

        <div className="progress-bar">
          <input
            type="range"
            min={mode === 'trim' ? trimStart : 0}
            max={mode === 'trim' ? trimEnd : duration}
            step={0.01}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
          />
          <div className="time-display">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </div>
        </div>

        <div className="button-group">
          <button onClick={() => stepFrame(-5)} title="Previous Frame">-5</button>
          <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={() => stepFrame(5)} title="Next Frame">+5</button>
          {mode === 'snaps' && (
            <button onClick={captureSnap} className="snap-btn">Snap@</button>
          )}
        </div>

        {mode === 'snaps' && (
          <div className="auto-snap-controls">
            <div className="auto-snap-header">
              <label>
                <input
                  type="checkbox"
                  checked={isAutoSnap}
                  onChange={(e) => setIsAutoSnap(e.target.checked)}
                  disabled={isBatchCapturing}
                />
                Auto-Snap (every {autoSnapInterval}s)
              </label>
              {isAutoSnap && (
                <button 
                  className="batch-btn" 
                  onClick={generateAllSnaps} 
                  disabled={isBatchCapturing}
                >
                  {isBatchCapturing ? 'Snapping...' : 'Generate All'}
                </button>
              )}
            </div>
            {isAutoSnap && (
              <input
                type="range"
                min={0.5}
                max={10}
                step={0.5}
                value={autoSnapInterval}
                onChange={(e) => setAutoSnapInterval(parseFloat(e.target.value))}
                disabled={isBatchCapturing}
              />
            )}
          </div>
        )}

        {mode === 'trim' && (
          <div className="trim-actions">
            <button className="trim-btn">Process & Download Trim</button>
          </div>
        )}

        <div className="footer-group">
          <button onClick={onReset} className="reset-btn" disabled={isBatchCapturing}>New Video</button>
        </div>
      </div>

      <style>{`
        .video-player {
          background-color: var(--surface-color);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 10px;
          ${isBatchCapturing ? 'opacity: 0.8; pointer-events: none;' : ''}
        }
        .video-container {
          width: 100%;
          background: #000;
          display: flex;
          justify-content: center;
          position: relative;
        }
        .batch-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          color: white;
          font-weight: bold;
        }
        video {
          max-width: 100%;
          max-height: 70vh;
        }
        .controls { padding: 16px; }
        .progress-bar { margin-bottom: 16px; }
        .progress-bar input { width: 100%; }
        .time-display {
          font-size: 12px;
          text-align: right;
          color: #aaa;
          margin-top: 4px;
        }
        .button-group {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .auto-snap-controls, .trim-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #222;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .auto-snap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .auto-snap-controls label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .batch-btn, .trim-btn {
          background-color: #5856d6;
          font-size: 11px;
          padding: 6px 10px;
        }
        .trim-btn {
          background-color: #34c759;
          font-size: 14px;
          width: 100%;
        }
        .footer-group {
          display: flex;
          justify-content: center;
        }
        .reset-btn {
          background-color: #444;
          font-size: 12px;
        }
        .snap-btn {
          background-color: #ff9500;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;

