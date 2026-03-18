import React, { useState, useRef, useEffect } from 'react';
import { Play, Maximize, RotateCcw } from 'lucide-react';

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const trimmed = url.trim();

  // Match /embed/VIDEO_ID
  let match = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Match ?v=VIDEO_ID
  match = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Match youtu.be/VIDEO_ID
  match = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  return null;
};

const VideoPlayer = ({ url, onEnded }) => {
  const videoId = getYouTubeVideoId(url);
  const iframeRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    if (videoId) {
      // Use highest quality thumbnail available
      setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    }
  }, [videoId]);

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  if (!url || !videoId) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center rounded-xl border border-white/5">
        <p className="text-gray-500 font-bold text-sm">ไม่พบลิงก์วิดีโอ</p>
      </div>
    );
  }

  // Show thumbnail with play button before starting
  if (!hasStarted) {
    return (
      <div
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl cursor-pointer group"
        onClick={() => setHasStarted(true)}
        onContextMenu={handleContextMenu}
      >
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-primary/95 text-white rounded-full flex items-center justify-center pl-1.5 shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] transform group-hover:scale-110 transition-all duration-300">
            <Play size={40} fill="currentColor" />
          </div>
        </div>

        {/* Label */}
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-widest">
          คลิกเพื่อเล่น
        </div>
      </div>
    );
  }

  // After clicking play, show the iframe
  return (
    <div
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
      onContextMenu={handleContextMenu}
    >
      <iframe
        ref={iframeRef}
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
        title="วิดีโอบทเรียน"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ border: 0 }}
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
