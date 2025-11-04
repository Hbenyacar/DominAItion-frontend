import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import InteractiveUSMap from "../../widgets/Maps/USA/USA";
import PlayerActionInput from "../../widgets/PlayerActionInput/PlayerActionInput";
import Navbar from "../navbar/NavBar";
import { RootState } from "../../store/store";
import "./Game.css";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import Europe from "../../widgets/Maps/USA/Europe";
import { Pause, PlayArrow, PlayCircle, SkipNext } from "@mui/icons-material";

function Game() {
  const map = useSelector((state: RootState) => state.map.map);
  const currentUserEmail = useSelector(
    (state: RootState) => state.auth.user?.email || null
  );

  /* ---------------------- START STATES ---------------------------- */
  const [showModal, setShowModal] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [storyResponse, setStoryResponse] = useState("");
  const [score, setScore] = useState(0); // 🟢 new state for score
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [chatInput, setChatInput] = useState("");

  /* ---------------------- START BACKGROUND MUSIC ---------------------------- */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(
    Number(localStorage.getItem("currentTrackIndex")) || 0
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const [musicEnabled, setMusicEnabled] = useState<boolean | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(
    Number(localStorage.getItem("currentTime")) || 0
  );

  useEffect(() => {
    const fetchMusicPreference = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/users/email/${currentUserEmail}`
        );
        if (!res.ok) throw new Error("Failed to fetch user");
        const user = await res.json();
        setMusicEnabled(user.musicEnabled ?? true); // default to true if missing
      } catch (err) {
        console.error("Error fetching user:", err);
        setMusicEnabled(true); // fallback to true if fetch fails
      }
    };

    fetchMusicPreference();
  }, [currentUserEmail]);

  useEffect(() => {
    if (musicEnabled === false) return; // Skip all if disabled
    if (musicEnabled === null) return; // Wait until loaded

    if (!audioRef.current) {
      audioRef.current = new Audio(
        `/assets/audio/Track${currentTrackIndex + 1}.mp3`
      );
      audioRef.current.volume = 0.4;
      audioRef.current.currentTime = currentTime;

      (window as any).globalGameAudio = audioRef.current;
    }

    const audio = audioRef.current;
    audio.loop = false;

    const handleEnded = () => {
      const next = (currentTrackIndex + 1) % 10;
      setCurrentTrackIndex(next);
      localStorage.setItem("currentTrackIndex", String(next));
      audio.src = `/assets/audio/Track${next + 1}.mp3`;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    audio.addEventListener("ended", handleEnded);

    if (isPlaying) {
      const startTimeout = setTimeout(() => {
        audio
          .play()
          .catch(() => console.log("Autoplay blocked until user interaction"));
      }, 3000);
      return () => clearTimeout(startTimeout);
    }

    const interval = setInterval(() => {
      if (!audio.paused) {
        localStorage.setItem("currentTrackIndex", String(currentTrackIndex));
        localStorage.setItem("currentTime", String(audio.currentTime));
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      audio.removeEventListener("ended", handleEnded);

      audio.pause();
      audio.currentTime = 0;

      localStorage.setItem("currentTrackIndex", String(currentTrackIndex));
      localStorage.setItem("currentTime", "0");

      audioRef.current = null;
    };
  }, [currentTrackIndex, isPlaying, musicEnabled]);

  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/game" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
  /* ---------------------- END BACKGROUND MUSIC ---------------------------- */

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // For now, hardcode the sender (later this will be the logged-in user)
    const newMessage = { sender: "You", text: chatInput.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");

    // (Later) send to backend:
    // fetch(`/api/games/${gameId}/chat`, { method: "POST", body: JSON.stringify(newMessage) })
  };
  const handleCloseModal = () => setShowModal(false);
  const tutorialSlides = [
    {
      title: "Welcome to DominAItion!",
      content: "Here is a short tutorial to get you started...",
    },
    {
      title: "Your Mission (Should you choose to accept it)",
      content:
        "Take over the world! You and the other players have a map divided out into regions. " +
        "You will think of unique actions you can take to gain more territory. " +
        "With each territory you take over, you gain more points. " +
        "The first one to get to the set number of points wins the game!",
    },
    {
      title: "All About The Map",
      content:
        "The map is divided into several regions you can take over. The resources and terrain in each region are determined based on the world description created on game creation.",
    },
    {
      title: "Who ARE you?",
      content:
        "The character you defined at the beginning of the game will have different traits that can make the actions you want to take more or less feasible. Plan your domination strategies wisely!",
    },
    { title: "Good luck, and have fun!" },
  ];
  const handlePrevSlide = () =>
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  const handleNextSlide = () =>
    setCurrentSlide((prev) => Math.min(prev + 1, tutorialSlides.length - 1));
  useEffect(() => {
    const modalShown = sessionStorage.getItem("modalShown");
    if (!modalShown) {
      setShowModal(true);
      sessionStorage.setItem("modalShown", "true");
    }
  }, []);

  // when storyResponse changes (i.e., new action result),
  // randomly add between 5 and 30 points
  useEffect(() => {
    if (storyResponse && storyResponse !== "Awaiting your first move...") {
      const utterance = new SpeechSynthesisUtterance(storyResponse);
      utterance.rate = 1.1; // 🔹 Speed (1.0 = normal)
      utterance.pitch = 1.0; // 🔹 Voice pitch
      utterance.volume = 1.0; // 🔹 Volume 0–1
      utterance.lang = "en-US"; // 🔹 Voice language

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find((v) =>
        v.name.toLowerCase().includes("female")
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      // Stop any ongoing speech before starting new one
      window.speechSynthesis.cancel();
      setIsNarrating(true);
      setIsPaused(false);
      window.speechSynthesis.speak(utterance);

      utterance.onend = () => {
        setIsNarrating(false);
        setIsPaused(false);
      };

      const pointsEarned = Math.floor(Math.random() * 26) + 5; // 5–30
      setScore((prev) => prev + pointsEarned);

      const audio = new Audio("/assets/sound_effects/point_won.mp3");
      audio.play();
    }
  }, [storyResponse]);
  const handlePauseNarration = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  const handleResumeNarration = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  const handleSkipNarration = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      setIsPaused(false);
    }
  };

  const [isMuted, setIsMuted] = useState(false);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // Optionally: stop sound alerts, notifications, etc.
  };

  return (
    <div className="game-page">
      {/* nav bar at top of screen */}
      <Navbar />

      {musicEnabled && (
        <Box
          sx={{
            position: "fixed",
            top: "15px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "12px",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "white",
            zIndex: 2000,
            backdropFilter: "blur(4px)",
            marginTop: "70px",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            Track {currentTrackIndex + 1}
          </Typography>

          <IconButton
            onClick={() => {
              if (!audioRef.current) return;
              if (audioRef.current.paused) {
                audioRef.current.play().catch(() => {});
                setIsPlaying(true);
              } else {
                audioRef.current.pause();
                setIsPlaying(false);
              }
            }}
            sx={{
              backgroundColor: "rgb(207,78,10)",
              "&:hover": { backgroundColor: "darkorange" },
              color: "white",
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          <IconButton
            onClick={() => {
              if (!audioRef.current) return;
              const next = (currentTrackIndex + 1) % 10;
              setCurrentTrackIndex(next);
              audioRef.current.src = `/assets/audio/Track${next + 1}.mp3`;
              audioRef.current.currentTime = 0;
              if (isPlaying) audioRef.current.play().catch(() => {});
            }}
            sx={{
              backgroundColor: "rgb(207,78,10)",
              "&:hover": { backgroundColor: "darkorange" },
              color: "white",
            }}
          >
            <SkipNext />
          </IconButton>
        </Box>
      )}

      {/* Outer wrapper: full viewport width */}
      <div className="content-wrapper">
        <div className="content">
          {/* Left game chat box */}
          <div
            className="game-chat"
            style={{
              marginLeft:
                map === "Medieval Europe"
                  ? "70px"
                  : map === "USA"
                  ? "50px"
                  : "0px",
              width: "220px",
              height: "400px",
              backgroundColor: "rgba(0,0,0,0.3)",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Title row with mute button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "8px",
                marginBottom: "10px",
              }}
            >


              {/* Title text */}
              <strong
                style={{
                  fontSize: "1.1rem",
                }}
              >
                Game Chat
              </strong>
            </div>

            {/* Scrollable message area */}
            <div
              id="chat-messages"
              style={{
                flexGrow: 1,
                overflowY: "auto",
                fontSize: "0.9rem",
                lineHeight: "1.3",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginBottom: "8px",
                maxHeight: "100%",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {isMuted ? (
                  <p style={{ opacity: 0.6 }}>Chat is muted</p>
                ) : messages.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>No messages yet...</p>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px",
                        padding: "4px 6px",
                        wordBreak: "break-word",
                      }}
                    >
                      <strong style={{ color: "rgb(207,78,10)" }}>{msg.sender}:</strong>{" "}
                      {msg.text}
                    </div>
                  ))
                )}
            </div>

            {/* Input row */}
            <div style={{ display: "flex", gap: "5px" }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                style={{
                  flexGrow: 1,
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "rgba(0,0,0,0.1)",
                  padding: "6px",
                  fontSize: "0.85rem",
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "rgb(207,78,10)", // 🔸 your orange
                  color: "white",
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
              
            </div>
                          {/* Mute button on the left */}
              <button
                onClick={handleMuteToggle}
                style={{
                  backgroundColor: isMuted ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
          </div>
          

          {/* Center map */}
          <div
            className="map-wrapper"
            style={{
              marginLeft: map === "Medieval Europe" ? "-100px" : "-20px",
            }}
          >
            {map === "USA" && <InteractiveUSMap />}
            {map === "Medieval Europe" && <Europe />}
          </div>

          {/* Right story box */}
          <div
            className="game-chat"
            style={{
              marginRight:
                map === "Medieval Europe"
                  ? "70px"
                  : map === "USA"
                  ? "50px"
                  : "10px",
              width: "300px",
              height: "400px",
              backgroundColor: "rgba(0,0,0,0.3)",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Title pinned at top */}
            <strong style={{ fontSize: "1.1rem", marginBottom: "10px" }}>
              Story Board
            </strong>

            {/* Scrollable story content */}
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                fontSize: "0.8rem",
                lineHeight: "1.3",
                textAlign: "justify",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {storyResponse || "Awaiting your first move..."}
            </div>
            <div
              style={{
                marginTop: "10px",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderRadius: "8px",
                padding: "8px",
                textAlign: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "1rem",
                boxShadow: "0px 0px 6px rgba(0,0,0,0.3)",
              }}
            >
              Score: {score}
            </div>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {isNarrating && !isPaused && (
                <Tooltip title="Pause Narration">
                  <IconButton
                    onClick={handlePauseNarration}
                    sx={{
                      backgroundColor: "rgb(207, 78, 10)",
                      color: "white",
                      "&:hover": { backgroundColor: "darkorange" },
                    }}
                  >
                    <Pause />
                  </IconButton>
                </Tooltip>
              )}

              {isNarrating && isPaused && (
                <Tooltip title="Resume Narration">
                  <IconButton
                    onClick={handleResumeNarration}
                    sx={{
                      backgroundColor: "rgb(207, 78, 10)",
                      color: "white",
                      "&:hover": { backgroundColor: "darkorange" },
                    }}
                  >
                    <PlayArrow />
                  </IconButton>
                </Tooltip>
              )}

              {isNarrating && (
                <Tooltip title="Skip Narration">
                  <IconButton
                    onClick={handleSkipNarration}
                    disabled={!isNarrating}
                    sx={{
                      backgroundColor: "rgb(207, 78, 10)",
                      color: "white",
                      "&:hover": { backgroundColor: "darkorange" },
                      opacity: !isNarrating ? 0.5 : 1,
                    }}
                  >
                    <SkipNext />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </div>
        </div>
      </div>

      {/* Player action input */}
      <div style={{ marginTop: "20px" }}>
        <PlayerActionInput onSubmitResponse={setStoryResponse} />
      </div>

      {/* Tutorial Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{tutorialSlides[currentSlide].title}</h2>
            <h3>{tutorialSlides[currentSlide].content}</h3>
            <div className="modal-navigation">
              <button onClick={handlePrevSlide} disabled={currentSlide === 0}>
                ←
              </button>
              <button
                onClick={handleNextSlide}
                disabled={currentSlide === tutorialSlides.length - 1}
              >
                →
              </button>
            </div>
            <button className="close-button" onClick={handleCloseModal}>
              {currentSlide === tutorialSlides.length - 1
                ? "Close"
                : "Skip Tutorial"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
