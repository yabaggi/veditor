import React from 'react';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  };

  return (
    <div className="uploader">
      <p>Select a video to start editing</p>
      <input
        type="file"
        accept="video/*"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="video-input"
      />
      <label htmlFor="video-input">
        <button type="button" onClick={() => document.getElementById('video-input')?.click()}>
          Upload Video
        </button>
      </label>
      <style>{`
        .uploader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          margin-top: 20px;
        }
        .uploader p {
          margin-bottom: 20px;
          color: #aaa;
        }
      `}</style>
    </div>
  );
};

export default VideoUploader;
