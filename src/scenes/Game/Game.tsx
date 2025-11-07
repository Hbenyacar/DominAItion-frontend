import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import InteractiveUSMap from "../../widgets/Maps/USA/USA";
import Europe from "../../widgets/Maps/USA/Europe";
import PlayerActionInput from "../../widgets/PlayerActionInput/PlayerActionInput";
import Navbar from "../navbar/NavBar";
import { RootState } from "../../store/store";
import { setWins } from "../../store/authSlice";
import "./Game.css";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Pause,
  PlayArrow,
  SkipNext,
  PictureAsPdf,
} from "@mui/icons-material";
import WinPopup from "../../components/WinPopup";
import { jsPDF } from "jspdf";

const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/";

interface GameInfo {
  id: string;
  worldId: string;
  players: any[];
  status: string;
  createdAt: string;
  [key: string]: any;
}

async function getPoints(gameId: string): Promise<GameInfo | null> {
  try {
    const response = await fetch("/api/game/getInfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    if (!response.ok) return null;
    return (await response.json()) as GameInfo;
  } catch {
    return null;
  }
}

async function sendStory({
                           gameId,
                           playerId,
                           request,
                           difficulty,
                         }: {
  gameId: string;
  playerId: string;
  request: string;
  difficulty: number;
}): Promise<string> {
  const response = await fetch("/api/ai/story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, playerId, request, difficulty }),
  });
  if (!response.ok) throw new Error("Failed to fetch story");
  return await response.text();
}

function Game() {
  const map = useSelector((state: RootState) => state.map.map);
  const params = useParams<{ gameId: string }>();
  const gameID = params.gameId!;
  const currentUserEmail = useSelector(
      (state: RootState) => state.auth.user?.email || ""
  );
  const currentUserID = useSelector(
      (state: RootState) => state.auth.user?.id || ""
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [storyResponses, setStoryResponses] = useState<string[]>([]);
  const storyBoxRef = useRef<HTMLDivElement | null>(null);

  const [score, setScore] = useState(0);
  const [winPoints, setWinPoints] = useState(2);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameInfo, setGameInfo] = useState<Record<string, any>[] | null>(null);
  const [territoryName, setTerritoryName] = useState("N/A");
  const [wonGame, setWonGame] = useState(false);
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("🎉 Congrats on your win!");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // ⏬ Auto-scroll story box when new story is added
  useEffect(() => {
    if (storyBoxRef.current) {
      storyBoxRef.current.scrollTop = storyBoxRef.current.scrollHeight;
    }
  }, [storyResponses]);

  // 🧠 Fetch game info
  const fetchGamePoints = async () => {
    const info = await getPoints(gameID);
    if (info) {
      setWinPoints(info.winningPoints || 3);
      setSummary(info.summary);
    }
  };

  const handleSend = async () => {
    try {
      const response = await sendStory({
        gameId: gameID,
        playerId: currentUserID,
        request: "Describe the next event in the game",
        difficulty: 2,
      });
      // Append new response
      setStoryResponses((prev) => [...prev, response]);
    } catch {
      setStoryResponses((prev) => [...prev, "Error retrieving story"]);
    }
  };

  // 🗣️ Narration handling
  useEffect(() => {
    const lastStory = storyResponses[storyResponses.length - 1];
    if (!lastStory || lastStory === "Awaiting your move...") return;

    const utterance = new SpeechSynthesisUtterance(lastStory);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = "en-US";

    window.speechSynthesis.cancel();
    setIsNarrating(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setIsNarrating(false);
      setIsPaused(false);
    };
  }, [storyResponses]);

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

  // 🎉 Win condition check
  useEffect(() => {
    if (score >= winPoints) {
      setWonGame(true);
      const audio = new Audio("/assets/sound_effects/game_won.mp3");
      audio.play();
    }
  }, [score]);

  return (
      <Box
          sx={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "bisque",
          }}
      >
        <Navbar />

        {/* ✅ Main game area */}
        <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "40px",
              overflow: "hidden",
            }}
        >
          {/* 🗺️ Map */}
          <Box
              sx={{
                flex: "1 1 60%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
          >
            {map === "USA" && (
                <InteractiveUSMap gameInfo={gameInfo} start={territoryName} />
            )}
            {map === "Medieval Europe" && <Europe />}
          </Box>

          {/* 📜 Story Board */}
          <Box
              sx={{
                flex: "0 0 25%",
                height: "75%",
                backgroundColor: "rgba(0,0,0,0.3)",
                borderRadius: "20px",
                padding: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "-4px 4px 10px rgba(0,0,0,0.3)",
              }}
          >
            {/* Header */}
            <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
            >
              <Typography
                  variant="h6"
                  sx={{ color: "white", fontWeight: "bold" }}
              >
                Story Board
              </Typography>

              <Tooltip title="Download as PDF">
                <IconButton
                    onClick={() => {
                      const doc = new jsPDF();
                      const content =
                          storyResponses.join("\n\n") || "Awaiting your move...";
                      const pageWidth = doc.internal.pageSize.getWidth();
                      const margin = 10;
                      const maxWidth = pageWidth - margin * 2;
                      const lines = doc.splitTextToSize(content, maxWidth);
                      doc.text(lines, margin, 20);
                      doc.save("storyboard.pdf");
                    }}
                    sx={{
                      color: "white",
                      "&:hover": { color: "orange" },
                    }}
                >
                  <PictureAsPdf />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Story Text */}
            <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  fontSize: "0.8rem",
                  textAlign: "justify",
                  color: "white",
                  maxHeight: "55vh",
                  pr: 1,
                }}
                ref={storyBoxRef}
            >
              {storyResponses.length === 0 ? (
                  <Typography
                      sx={{
                        color: "lightgray",
                        fontSize: "0.7rem",
                        lineHeight: 1.4,
                      }}
                  >
                    Awaiting your move...
                  </Typography>
              ) : (
                  storyResponses.map((story, index) => (
                      <Box
                          key={index}
                          sx={{
                            mb: 2,
                            p: 1,
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderRadius: "6px",
                          }}
                      >
                        <Typography
                            sx={{
                              color: "lightgray",
                              fontSize: "0.7rem",
                              lineHeight: 1.4,
                            }}
                        >
                          {story}
                        </Typography>
                      </Box>
                  ))
              )}
            </Box>

            {/* Narration Controls */}
            <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  mt: 1,
                }}
            >
              {isNarrating && !isPaused && (
                  <Tooltip title="Pause Narration">
                    <IconButton
                        onClick={handlePauseNarration}
                        sx={{
                          backgroundColor: "rgb(207,78,10)",
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
                          backgroundColor: "rgb(207,78,10)",
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
                        sx={{
                          backgroundColor: "rgb(207,78,10)",
                          color: "white",
                          "&:hover": { backgroundColor: "darkorange" },
                        }}
                    >
                      <SkipNext />
                    </IconButton>
                  </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        {/* 🧠 Input Box */}
        <Box
            sx={{
              height: "10vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
        >
          <PlayerActionInput
              gameId={gameID}
              playerId={currentUserID}
              onSubmitResponse={(response) =>
                  setStoryResponses((prev) => [...prev, response])
              }
          />
        </Box>

        {/* 🎉 Win popup */}
        {wonGame && (
            <WinPopup wonGame={wonGame} message={message} />
        )}
      </Box>
  );
}

export default Game;
