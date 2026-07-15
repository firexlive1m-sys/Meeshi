import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { VIDEO_REVIEWS } from '../data';
import { Play, VolumeX, Volume2, Pause, RotateCcw, RotateCw } from 'lucide-react';

export default function VideoReviews() {
  return (
    <section id="video-reviews-section" className="py-16 bg-[#0F172A] relative">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold text-[#3B82F6] uppercase tracking-widest block mb-1">
            Real Sellers, Real Stories
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display">
            Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">Testimonials</span>
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-sm mx-auto">
            Watch short video reviews from Indian sellers who upgraded their Meesho listings speed.
          </p>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {VIDEO_REVIEWS.map((vReview) => (
            <VideoCard key={vReview.id} review={vReview} />
          ))}
        </div>

      </div>
    </section>
  );
}

interface VideoCardProps {
  key?: string;
  review: {
    id: string;
    name: string;
    role: string;
    thumbnail: string;
    videoUrl: string;
  };
}

function VideoCard({ review }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Listen to other video plays to pause when another starts
  useEffect(() => {
    const handleOtherVideoPlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail && customEvent.detail.id !== review.id) {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener('app-video-play', handleOtherVideoPlay);
    return () => {
      window.removeEventListener('app-video-play', handleOtherVideoPlay);
    };
  }, [review.id]);

  const formatVideoTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = (e: MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        window.dispatchEvent(new CustomEvent('app-video-play', { detail: { id: review.id } }));
      }).catch((err) => {
        console.log("Video play interrupted:", err);
      });
    }
  };

  const handleSkip = (e: MouseEvent, seconds: number) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = (e: MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const targetMute = !isMuted;
    videoRef.current.muted = targetMute;
    setIsMuted(targetMute);
  };

  // Append #t=0.1 to video URL to make sure browsers render the first frame of the video as thumbnail
  const videoSrcWithTimestamp = review.videoUrl.indexOf('#') === -1 ? `${review.videoUrl}#t=0.1` : review.videoUrl;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-[#1E293B] border border-[#334155] p-4 rounded-2xl hover:border-blue-500/10 shadow-lg relative overflow-hidden group flex flex-col justify-between"
    >
      
      {/* Video Container Aspect 16:9 (Landscape) containing 9:16 Shorts */}
      <div 
        onClick={togglePlay}
        className="relative aspect-video rounded-xl overflow-hidden bg-black cursor-pointer shadow-inner border border-[#334155]/40 group/player w-full"
      >
        <video
          ref={videoRef}
          src={videoSrcWithTimestamp}
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          className="w-full h-full object-contain opacity-95 transition-transform duration-500"
        />

        {/* Dynamic visual pause-state overlay with custom play button */}
        {!isPlaying && (
          <div 
            onClick={togglePlay}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all flex flex-col items-center justify-center gap-3 z-25 cursor-pointer animate-fade-in"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] flex items-center justify-center border-2 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:shadow-[0_0_45px_rgba(59,130,246,0.8)] transition-shadow duration-300 pointer-events-auto"
            >
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </motion.div>
            <span className="text-white text-[9px] sm:text-xs font-black uppercase tracking-widest font-mono bg-[#0F172A]/95 border border-[#334155] px-3 sm:px-4.5 py-1.5 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
              Click to play video
            </span>
          </div>
        )}

        {/* Bottom Custom Navigation & Timeline Controls Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/95 via-black/75 to-transparent z-20 flex flex-col gap-1.5 opacity-100 md:opacity-40 hover:opacity-100 group-hover/player:opacity-100 transition-opacity duration-300">
          
          {/* 1. Timeline Progress Bar */}
          <div 
            onClick={handleProgressClick}
            className="relative w-full h-1 bg-gray-800/80 rounded-full cursor-pointer group/progress transition-all"
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3B82F6] via-sky-500 to-[#2563EB] rounded-full"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 border border-white shadow-xl transition-all scale-0 group-hover/progress:scale-100"
              style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>

          {/* 2. Controls and Actions Row */}
          <div className="flex items-center justify-between gap-2 text-white pointer-events-auto">
            
            {/* Left elements: Play/Pause, Skip Back, Skip Forward */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                onClick={togglePlay}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer hover:scale-105 active:scale-95 duration-150 transition-all shrink-0"
                title={isPlaying ? "Pause Video" : "Play Video"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-blue-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
              </button>

              {/* Skip -10s */}
              <button
                onClick={(e) => handleSkip(e, -10)}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#0F172A]/60 hover:bg-[#1E293B] border border-[#334155]/20 text-[9px] font-mono font-bold text-gray-200 cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Rewind 10s"
              >
                <RotateCcw className="w-3 h-3 text-blue-400 shrink-0" />
                <span>-10s</span>
              </button>

              {/* Skip +10s */}
              <button
                onClick={(e) => handleSkip(e, 10)}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#0F172A]/60 hover:bg-[#1E293B] border border-[#334155]/20 text-[9px] font-mono font-bold text-gray-200 cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0"
                title="Forward 10s"
              >
                <RotateCw className="w-3 h-3 text-sky-400 shrink-0" />
                <span>+10s</span>
              </button>

              {/* Time displays */}
              <div className="text-[9px] sm:text-[10px] font-mono text-gray-450 font-bold select-none ml-1.5 shrink-0">
                {formatVideoTime(currentTime)} <span className="text-gray-600">/</span> {formatVideoTime(duration)}
              </div>
            </div>

            {/* Right element: Mute/Unmute */}
            <div className="flex items-center shrink-0">
              <button
                onClick={toggleMute}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer duration-150 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>

          </div>

        </div>

        {/* Subtle glow border around top */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-450/30 to-transparent opacity-80" />
      </div>

      {/* Info label on bottom */}
      <div className="mt-3.5 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white font-display">{review.name}</h4>
          <p className="text-[10px] text-[#3B82F6] font-mono mt-0.5">{review.role}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
            VERIFIED REVIEW
          </span>
        </div>
      </div>

    </motion.div>
  );
}

