import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Play } from 'lucide-react';

// Detect URL type for thumbnail and player branding
const isVimeo = (url) => url && url.includes('vimeo.com');
const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  let match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
};

const VideoPlayer = ({ url, onEnded }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const thumbnailUrl = isYouTube(url) ? getYouTubeThumbnail(url) : null;
  const platformLabel = isVimeo(url) ? 'Vimeo' : isYouTube(url) ? 'YouTube' : 'วิดีโอ';

  const handleContextMenu = (e) => e.preventDefault();

  if (!url || !ReactPlayer.canPlay(url)) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center rounded-xl border border-white/5">
        <p className="text-gray-500 font-bold text-sm">ไม่พบลิงก์วิดีโอ หรือลิงก์ไม่ถูกต้อง</p>
      </div>
    );
  }

  // Custom Thumbnail / Splash Screen before play
  if (!hasStarted) {
    return (
      <button
        type="button"
        className="relative w-full aspect-video bg-slate-900 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] cursor-pointer group"
        onClick={() => setHasStarted(true)}
        onContextMenu={handleContextMenu}
        aria-label="เริ่มเล่นวิดีโอ"
      >
        {/* Thumbnail (YouTube only - Vimeo blocks hotlink) */}
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="ภาพตัวอย่างวิดีโอ"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        {/* Vimeo Gradient Background (no thumbnail hotlink) */}
        {isVimeo(url) && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1ab7ea]/20 to-slate-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:bg-black/10 transition-colors duration-500" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-full flex items-center justify-center pl-1 shadow-[0_0_40px_rgba(255,255,255,0.2)] transform group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500">
              <Play size={44} fill="currentColor" className="drop-shadow-lg" />
            </div>
          </div>
        </div>

        {/* Platform Badge */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 glass px-5 py-2 rounded-full text-[11px] font-bold text-white uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-all border border-white/20 shadow-xl">
          {platformLabel} · เริ่มเรียน
        </div>
      </button>
    );
  }

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
      onContextMenu={handleContextMenu}
    >
      <ReactPlayer
        url={url}
        playing
        controls
        width="100%"
        height="100%"
        onEnded={onEnded}
        config={{
          youtube: {
            playerVars: { rel: 0, modestbranding: 1, playsinline: 1 }
          },
          vimeo: {
            playerOptions: { byline: false, portrait: false, title: false, color: '4f46e5' }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;

