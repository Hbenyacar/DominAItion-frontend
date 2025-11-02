// src/components/BackgroundPlaylist.tsx
import React, { useEffect, useRef, useState } from "react";

const BackgroundPlaylist: React.FC = () => {
  // list all songs in order — adjust names to match your files
  const songs = [
    "/assets/audio/track1.mp3",
    "/assets/audio/track2.mp3",
    "/assets/audio/track3.mp3",
    "/assets/audio/track4.mp3",
    "/assets/audio/track5.mp3",
    "/assets/audio/track6.mp3",
    "/assets/audio/track7.mp3",
    "/assets/audio/track8.mp3",
    "/assets/audio/track9.mp3",
    "/assets/audio/track10.mp3",
  ];

  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;

    if (isPlaying) {
      audio.play().catch(() => {
        console.warn("Autoplay blocked. Waiting for user interaction.");
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // handle track end → move to next
  const handleEnded = () => {
    setCurrentTrack((prev) => (prev + 1) % songs.length);
  };

  return (
    <div>
      <audio ref={audioRef} src={songs[currentTrack]} onEnded={handleEnded} />
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "6px 12px",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.2)",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {isPlaying ? "🔇 Mute" : "🔊 Play"}
      </button>
    </div>
  );
};

export default BackgroundPlaylist;
