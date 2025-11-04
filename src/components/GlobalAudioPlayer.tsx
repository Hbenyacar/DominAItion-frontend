import React, { useEffect, useRef, useState } from "react";

const GlobalAudioPlayer: React.FC = () => {
  const tracks = Array.from(
    { length: 10 },
    (_, i) => `/assets/audio/Track${i + 1}.mp3`
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    const savedTrack = localStorage.getItem("currentTrackIndex");
    const savedTime = localStorage.getItem("currentTime");

    // Read user settings
    const musicEnabled = localStorage.getItem("musicEnabled") !== "false"; // default true
    const musicPaused = localStorage.getItem("musicPaused") === "true"; // default false
    const musicAllowed = localStorage.getItem("musicAllowed") === "true"; // user clicked once before

    const trackIndex = savedTrack ? parseInt(savedTrack, 10) : 0;
    setCurrentTrackIndex(trackIndex);
    audio.src = `/assets/audio/Track${trackIndex + 1}.mp3`;
    audio.loop = false;
    audio.volume = 0.4;

    if (savedTime) audio.currentTime = parseFloat(savedTime);

    const handleEnded = () => {
      const next = (trackIndex + 1) % tracks.length;
      setCurrentTrackIndex(next);
      audio.src = tracks[next];
      if (musicEnabled && !musicPaused) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener("ended", handleEnded);

    // Save progress before page unload
    const saveProgress = () => {
      localStorage.setItem("currentTrackIndex", trackIndex.toString());
      localStorage.setItem("currentTime", audio.currentTime.toString());
    };

    window.addEventListener("beforeunload", saveProgress);

    // ✅ Respect user’s settings
    if (!musicEnabled) {
      // Music disabled entirely
      audio.pause();
      return () => {
        audio.pause();
        audio.removeEventListener("ended", handleEnded);
        window.removeEventListener("beforeunload", saveProgress);
        saveProgress();
      };
    }

    // ✅ Handle autoplay permission + play/pause
    const startPlayback = () => {
      if (!isReady && musicEnabled && !musicPaused) {
        audio
          .play()
          .then(() => {
            setIsReady(true);
            window.removeEventListener("click", startPlayback);
          })
          .catch(() => console.log("Playback still blocked"));
      }
    };

    if (musicAllowed) {
      // User already interacted before
      if (!musicPaused) {
        audio.play().catch(() => {});
      }
      setIsReady(true);
    } else {
      window.addEventListener("click", () => {
        localStorage.setItem("musicAllowed", "true");
        if (musicEnabled && !musicPaused) startPlayback();
      });
    }

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      window.removeEventListener("beforeunload", saveProgress);
      saveProgress();
    };
  }, [tracks]);

  return null;
};

export default GlobalAudioPlayer;
