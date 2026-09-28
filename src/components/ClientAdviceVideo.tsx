import { useEffect, useRef, useState } from 'react';
import { Maximize2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type VideoEmbed =
  | { type: 'iframe'; src: string }
  | { type: 'video'; src: string };

type Props = {
  embed: VideoEmbed;
  title: string;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function ClientAdviceVideo({ embed, title }: Props) {
  const [iframeKey, setIframeKey] = useState(0);

  if (embed.type === 'iframe') {
    return (
      <div className="overflow-hidden rounded-[28px] bg-zinc-950 p-1.5 shadow-soft ring-1 ring-black/10">
        <div className="relative aspect-video overflow-hidden rounded-[22px] bg-black">
          <iframe
            key={iframeKey}
            title={title}
            src={`${embed.src}${embed.src.includes('?') ? '&' : '?'}controls=1&rel=0`}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="flex items-center justify-between gap-3 bg-zinc-950 px-3 py-3 text-white sm:px-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Vídeo de orientação</p>
            <p className="mt-1 text-sm font-medium">Assista antes do dia da pintura</p>
          </div>
          <button
            type="button"
            onClick={() => setIframeKey((value) => value + 1)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold transition hover:bg-white/10"
            aria-label="Voltar o vídeo ao começo"
          >
            <RotateCcw className="h-4 w-4" /> Recomeçar
          </button>
        </div>
      </div>
    );
  }

  return <DirectVideo src={embed.src} title={title} />;
}

function DirectVideo({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
  }, [src]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }

  function restart() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function seek(value: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrent(value);
  }

  async function fullscreen() {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await shell.requestFullscreen?.();
  }

  return (
    <div ref={shellRef} className="overflow-hidden rounded-[28px] bg-zinc-950 p-1.5 shadow-soft ring-1 ring-black/10">
      <div className="relative overflow-hidden rounded-[22px] bg-black">
        <video
          ref={videoRef}
          src={src}
          className="aspect-video w-full object-contain"
          playsInline
          preload="metadata"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
          aria-label={title}
        />
      </div>
      <div className="bg-zinc-950 px-3 pb-3 pt-2 text-white sm:px-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(current, duration || 0)}
          onChange={(event) => seek(Number(event.target.value))}
          className="mb-2 h-1.5 w-full cursor-pointer accent-[#f685b3]"
          aria-label="Progresso do vídeo"
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={togglePlay} className="grid h-9 w-9 place-items-center rounded-full bg-white text-zinc-950 transition hover:scale-105" aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}>
            {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
          </button>
          <button type="button" onClick={restart} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition hover:bg-white/10" aria-label="Voltar o vídeo ao começo">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" onClick={toggleMute} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition hover:bg-white/10" aria-label={muted ? 'Ativar som' : 'Silenciar vídeo'}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <span className="ml-1 text-xs tabular-nums text-zinc-400">{formatTime(current)} / {formatTime(duration)}</span>
          <button type="button" onClick={() => void fullscreen()} className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-white/15 transition hover:bg-white/10" aria-label="Tela cheia">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
