import React, { useMemo } from 'react';
import VideoUploader from './VideoUploader';
import VideoPlayer from './VideoPlayer';

interface VideoSectionProps {
  videoFile: File | null;
  onVideoSelect: (file: File | null) => void;
  mode: 'snaps' | 'trim';
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoFile, onVideoSelect, mode }) => {
  const videoUrl = useMemo(() => (videoFile ? URL.createObjectURL(videoFile) : null), [videoFile]);

  return (
    <section>
      {!videoFile ? (
        <VideoUploader onVideoSelect={onVideoSelect} />
      ) : (
        <VideoPlayer 
          src={videoUrl!} 
          onReset={() => onVideoSelect(null)} 
          mode={mode}
        />
      )}
    </section>
  );
};

export default VideoSection;
