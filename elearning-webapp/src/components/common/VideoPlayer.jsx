import React, { useMemo, useState } from 'react';
import ReactPlayer from 'react-player';
import { Play, AlertCircle, ExternalLink } from 'lucide-react';

const ensureAbsoluteUrl = (url) => {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/i.test(trimmed)) return `https://${trimmed.replace(/^\/+/, '')}`;
  return trimmed;
};

const getYouTubeId = (url) => {
  if (!url) return '';

  const safeUrl = ensureAbsoluteUrl(url);

  try {
    const parsed = new URL(safeUrl);
    const hostname = parsed.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return parsed.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (hostname.endsWith('youtube.com')) {
      if (parsed.pathname.startsWith('/watch')) {
        return parsed.searchParams.get('v') || '';
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || '';
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || '';
      }
    }
  } catch {
    return '';
  }

  return '';
};

const getVimeoId = (url) => {
  if (!url) return '';

  const safeUrl = ensureAbsoluteUrl(url);

  try {
    const parsed = new URL(safeUrl);
    const hostname = parsed.hostname.replace(/^www\./, '');

    if (!hostname.endsWith('vimeo.com')) {
      return '';
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || '';
  } catch {
    return '';
  }
};

const normalizeProviderUrl = (url) => {
  const safeUrl = ensureAbsoluteUrl(url);
  const youtubeId = getYouTubeId(safeUrl);

  if (youtubeId) {
    return `https://www.youtube.com/watch?v=${youtubeId}`;
  }

  return safeUrl;
};

const isVimeo = (url) => url && url.includes('vimeo.com');
const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

const getYouTubeThumbnail = (url) => {
  const videoId = getYouTubeId(url);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return null;
};

const isDirectMediaUrl = (url) => {
  if (!url) return false;
  if (isYouTube(url) || isVimeo(url)) return false;

  const lowerUrl = url.toLowerCase().split('?')[0];

  return [
    '.mp4',
    '.webm',
    '.ogg',
    '.ogv',
    '.mov',
    '.m4v',
    '.m3u8',
  ].some((extension) => lowerUrl.endsWith(extension)) || lowerUrl.includes('/storage/v1/object/public/');
};

const VideoPlayer = ({ url, onEnded }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [playbackError, setPlaybackError] = useState('');

  const normalizedUrl = useMemo(() => normalizeProviderUrl(url), [url]);
  const youtubeId = useMemo(() => getYouTubeId(normalizedUrl), [normalizedUrl]);
  const vimeoId = useMemo(() => getVimeoId(normalizedUrl), [normalizedUrl]);
  const thumbnailUrl = useMemo(() => (isYouTube(normalizedUrl) ? getYouTubeThumbnail(normalizedUrl) : null), [normalizedUrl]);
  const isDirectMedia = useMemo(() => isDirectMediaUrl(normalizedUrl), [normalizedUrl]);
  const platformLabel = isVimeo(normalizedUrl) ? 'Vimeo' : isYouTube(normalizedUrl) ? 'YouTube' : 'วิดีโอ';
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : '';
  const vimeoEmbedUrl = vimeoId
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`
    : '';

  const handleContextMenu = (event) => event.preventDefault();

  if (!normalizedUrl || (!isDirectMedia && !ReactPlayer.canPlay(normalizedUrl))) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-white/5 bg-gray-900">
        <p className="text-sm font-bold text-gray-500">ไม่พบลิงก์วิดีโอ หรือลิงก์ไม่ถูกต้อง</p>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <button
        type="button"
        className="group relative w-full aspect-video cursor-pointer overflow-hidden rounded-2xl bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.2)] md:rounded-[2.5rem]"
        onClick={() => {
          setPlaybackError('');
          setHasStarted(true);
        }}
        onContextMenu={handleContextMenu}
        aria-label="เริ่มเล่นวิดีโอ"
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="ภาพตัวอย่างวิดีโอ"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(event) => {
              event.target.style.display = 'none';
            }}
          />
        )}

        {isVimeo(normalizedUrl) && <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1ab7ea]/20 to-slate-950" />}
        {!thumbnailUrl && !isVimeo(normalizedUrl) && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.3),_transparent_35%),linear-gradient(180deg,#111827_0%,#020617_100%)]" />}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-colors duration-500 group-hover:bg-black/10" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-white/20 opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/20 pl-1 text-white shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-500 group-hover:scale-110 group-hover:bg-white/30">
              <Play size={44} fill="currentColor" className="drop-shadow-lg" />
            </div>
          </div>
        </div>

        <div className="glass absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/20 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white opacity-80 shadow-xl transition-all group-hover:opacity-100 md:left-8 md:translate-x-0">
          {platformLabel} • เริ่มเรียน
        </div>
      </button>
    );
  }

  if (playbackError) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-red-500/20 bg-slate-950 p-6 shadow-2xl">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
          <p className="mb-2 text-lg font-black text-white">วิดีโอนี้เล่นในหน้าเว็บไม่ได้</p>
          <p className="text-sm font-medium leading-relaxed text-slate-400">
            ลิงก์วิดีโออาจไม่ใช่ไฟล์วิดีโอโดยตรง หรือเซิร์ฟเวอร์ต้นทางไม่อนุญาตให้ฝังเล่นในหน้าเว็บ
          </p>
          <a
            href={normalizedUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            เปิดลิงก์วิดีโอโดยตรง
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    );
  }

  if (youtubeEmbedUrl || vimeoEmbedUrl) {
    return (
      <div
        className="relative w-full aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl"
        onContextMenu={handleContextMenu}
      >
        <iframe
          src={youtubeEmbedUrl || vimeoEmbedUrl}
          title="Embedded video player"
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onError={() => {
            setPlaybackError('embed-failed');
          }}
        />
      </div>
    );
  }

  if (isDirectMedia) {
    return (
      <div
        className="relative w-full aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl"
        onContextMenu={handleContextMenu}
      >
        <video
          src={normalizedUrl}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="h-full w-full"
          onEnded={onEnded}
          onError={() => {
            setPlaybackError('direct-media-failed');
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl"
      onContextMenu={handleContextMenu}
    >
      <ReactPlayer
        url={normalizedUrl}
        playing
        controls
        width="100%"
        height="100%"
        onEnded={onEnded}
        onError={() => {
          setPlaybackError('provider-failed');
        }}
        config={{
          youtube: {
            playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          },
          vimeo: {
            playerOptions: { byline: false, portrait: false, title: false, color: '4f46e5' },
          },
        }}
      />
    </div>
  );
};

export default VideoPlayer;
