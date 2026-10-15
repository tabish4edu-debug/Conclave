import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, Loader2 } from 'lucide-react';
import { Project } from '../../types';

interface ProjectVideoModalProps {
  project: Project;
  onClose: () => void;
}

export const ProjectVideoModal: React.FC<ProjectVideoModalProps> = ({ project, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoUrl = project.videoUrl;

  // Lock background scroll while modal is active & cleanly release video streaming buffers on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.removeAttribute('src');
          videoRef.current.load();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Keyboard navigation & playback shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'ArrowRight' && videoRef.current) {
        e.preventDefault();
        videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 5);
      } else if (e.key === 'ArrowLeft' && videoRef.current) {
        e.preventDefault();
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus modal on mount and ensure clean teardown on unmount
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
    const video = videoRef.current;
    return () => {
      if (video) {
        try {
          video.pause();
          video.removeAttribute('src');
          video.load();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Gracefully handle browser autoplay policy
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            // Autoplay with sound restricted by browser; retry muted
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  setIsLoading(false);
                })
                .catch(() => {
                  setIsPlaying(false);
                  setIsLoading(false);
                });
            }
          });
      }
    }
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = Number(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    if (val === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTo = Number(e.target.value);
    videoRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 outline-none"
      onClick={(e) => {
        // Dismiss if clicking background backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-5xl bg-[#141517] border border-[#3A3C3E] shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2D2F] bg-[#18191B] z-10">
          <div className="space-y-0.5 pr-4 truncate">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#B08D57] font-mono font-semibold block truncate">
              {project.category} · ARCHITECTURAL WALKTHROUGH
            </span>
            <h3 id="video-modal-title" className="font-serif-title text-base sm:text-xl text-[#F2EEE7] truncate">
              {project.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close video player"
            className="p-2 text-[#D8CFC1] hover:text-white bg-[#222426] hover:bg-[#2B2D2F] border border-[#3A3C3E] rounded-xs transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Canvas */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 space-y-3">
              <Loader2 className="w-8 h-8 text-[#B08D57] animate-spin" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#D8CFC1]">
                Buffering Architectural Video...
              </span>
            </div>
          )}

          {hasError ? (
            <div className="p-8 text-center space-y-3 max-w-md">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="font-serif-title text-lg text-[#F2EEE7]">Video Walkthrough Unavailable</h4>
              <p className="text-xs text-[#8C8276] leading-relaxed">
                {errorMessage || 'The attached project video could not be streamed or is in an unsupported format.'}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-[#202124] border border-[#3A3C3E] text-xs font-mono text-[#F2EEE7] hover:border-[#B08D57] transition-colors"
              >
                Return to Gallery
              </button>
            </div>
          ) : videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              playsInline
              preload="metadata"
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                  setIsLoading(false);
                }
              }}
              onError={(e) => {
                console.warn('Video playback error:', e);
                setHasError(true);
                setErrorMessage('Unable to load video stream. The media file may have been moved or requires transcoding.');
                setIsLoading(false);
              }}
              className="w-full h-full object-contain cursor-pointer"
            />
          ) : (
            <div className="p-6 text-center text-xs text-[#8C8276] font-mono">
              No video file attached to this project.
            </div>
          )}
        </div>

        {/* Video Controls Bar */}
        {!hasError && videoUrl && (
          <div className="p-4 bg-[#18191B] border-t border-[#2B2D2F] flex flex-col gap-2">
            {/* Timeline Progress Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[#D8CFC1]/70 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                aria-label="Seek video position"
                className="flex-1 h-1.5 bg-[#2B2D2F] rounded-lg appearance-none cursor-pointer accent-[#B08D57]"
              />
              <span className="text-[10px] font-mono text-[#D8CFC1]/70 w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Play, Mute & Fullscreen Cluster */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  className="p-2 bg-[#222426] hover:bg-[#2B2D2F] text-[#F2EEE7] hover:text-[#B08D57] transition-colors rounded-xs cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute video (M)' : 'Mute video (M)'}
                    className="p-2 text-[#D8CFC1] hover:text-[#B08D57] transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Adjust volume"
                    className="w-14 sm:w-20 h-1 bg-[#2B2D2F] rounded-lg appearance-none cursor-pointer accent-[#B08D57]"
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-[#D8CFC1]/50 hidden md:inline">
                  Space: Play · M: Mute · ←/→: 5s · F: Fullscreen · Esc: Close
                </span>

                <button
                  onClick={toggleFullscreen}
                  aria-label="Toggle fullscreen (F)"
                  title="Fullscreen (F)"
                  className="p-2 text-[#D8CFC1] hover:text-[#B08D57] transition-colors cursor-pointer"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
