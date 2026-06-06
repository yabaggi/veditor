import React, { useRef, useState, useEffect } from 'react';
import TrimSlider from './TrimSlider';
import { saveExportToDb } from '../utils/db';
import { useProject } from '../store/ProjectContext';

interface TrimSectionProps {
  videoFile: File | null;
}

const TrimSection: React.FC<TrimSectionProps> = ({ videoFile }) => {
  const { activeProject } = useProject();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoUrl = React.useMemo(() => (videoFile ? URL.createObjectURL(videoFile) : null), [videoFile]);

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
      if (time >= trimEnd) {
        videoRef.current.currentTime = trimStart;
        if (!isPlaying) videoRef.current.pause();
      }
      if (time < trimStart) {
        videoRef.current.currentTime = trimStart;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setTrimEnd(videoRef.current.duration);
    }
  };

  const handleTrimDownload = async () => {
    if (!videoRef.current || !videoFile) return;
    setIsProcessing(true);
    setProgress(0);

    const video = videoRef.current;
    const stream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream();
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      
      if (activeProject?.id) {
        await saveExportToDb({
          projectId: activeProject.id,
          name: `trimmed-${videoFile.name.split('.')[0]}-${Date.now()}.webm`,
          type: 'md', // Reusing type or mapping webm to something else. For now, MD works as a generic slot
          blob,
          createdAt: Date.now()
        });
        alert('Trimmed video saved to Assets tab!');
      }

      setIsProcessing(false);
    };

    // Start recording
    video.currentTime = trimStart;
    video.play();
    recorder.start();

    const checkEnd = setInterval(() => {
      const current = video.currentTime;
      const total = trimEnd - trimStart;
      const currentProgress = ((current - trimStart) / total) * 100;
      setProgress(Math.min(100, Math.max(0, currentProgress)));

      if (current >= trimEnd) {
        clearInterval(checkEnd);
        recorder.stop();
        video.pause();
      }
    }, 100);
  };

  if (!videoFile) return <p>Please upload a video in the Snaps tab first.</p>;

  return (
    <div className="trim-section">
      <div className="video-container">
        <video
          ref={videoRef}
          src={videoUrl!}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          muted // Must be muted for some browsers to capture stream easily
          playsInline
        />
        {isProcessing && (
          <div className="processing-overlay">
            Recording... {progress.toFixed(0)}%
          </div>
        )}
      </div>

      <div className="controls">
        <TrimSlider
          duration={duration}
          start={trimStart}
          end={trimEnd}
          onChange={(s, e) => {
            setTrimStart(s);
            setTrimEnd(e);
          }}
        />

        <div className="progress-bar">
          <input
            type="range"
            min={trimStart}
            max={trimEnd}
            step={0.01}
            value={currentTime}
            onChange={(e) => { if (videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value); }}
          />
        </div>

        <div className="button-group">
          <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button 
            className="download-btn" 
            onClick={handleTrimDownload} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Process Trimmed Segment'}
          </button>
        </div>
      </div>

      <style>{`
        .trim-section { margin-top: 10px; }
        .video-container {
          width: 100%;
          background: #000;
          display: flex;
          justify-content: center;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
        }
        video { max-width: 100%; max-height: 60vh; }
        .processing-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          z-index: 20;
        }
        .controls { padding: 16px; background: var(--surface-color); border-radius: 12px; margin-top: 10px; }
        .progress-bar { margin-bottom: 16px; }
        .progress-bar input { width: 100%; }
        .button-group { display: flex; gap: 10px; }
        .download-btn { background-color: #34c759; flex: 1; }
      `}</style>
    </div>
  );
};

export default TrimSection;
