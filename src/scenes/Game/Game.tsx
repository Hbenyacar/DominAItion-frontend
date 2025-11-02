import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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

  // 🟢 When storyResponse changes (i.e., new action result),
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

  return (
    <div className="game-page">
      <Navbar />

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
            {/* Title pinned at top */}
            <strong
              style={{
                fontSize: "1.1rem",
                marginBottom: "10px",
              }}
            >
              Game Chat
            </strong>

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
              }}
            >
              {messages.length === 0 ? (
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
                    <strong style={{ color: "rgb(207,78,10)" }}>
                      {msg.sender}:
                    </strong>{" "}
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
    </div>
  );
}

export default Game;
