import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import InteractiveUSMap from "../../widgets/Maps/USA/USA";
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
import Europe from "../../widgets/Maps/USA/Europe";
import { Pause, PlayArrow, PlayCircle, SkipNext } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import WinPopup from "../../components/WinPopup";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/";

interface RouteParams {
  gameId: string;
}

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId }),
    });

    if (!response.ok) {
      console.error("Failed to fetch game info:", response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Fetched game info:", data);
    return data as GameInfo;
  } catch (error) {
    console.error("Error fetching game info:", error);
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
  try {
    const response = await fetch("/api/ai/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        playerId,
        request,
        difficulty,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    console.log("text: " + text);
    return text;
  } catch (error) {
    console.error("Failed to send story request:", error);
    throw error;
  }
}

function Game() {
  const map = useSelector((state: RootState) => state.map.map);
  const params = useParams<{ gameId: string }>();
  const gameID = params.gameId;
  const currentUserEmail = useSelector(
    (state: RootState) => state.auth.user?.email || null
  );
  const currentUserID = useSelector(
    (state: RootState) => state.auth.user?.id || null
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);

  const [secondsSpent, setSecondsSpent] = useState(0);
  const sessionStartRef = useRef<Date | null>(null);

  /* ---------------------- START STATES ---------------------------- */
  const [showModal, setShowModal] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [storyResponse, setStoryResponse] = useState("");
  const [score, setScore] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const dispatch = useDispatch();

  const [gameId, setGameId] = useState<string | null>(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState<
    boolean | undefined
  >(undefined);

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

  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleSend = async () => {
    setLoading(true);
    try {
      const response = await sendStory({
        gameId: `${gameID}`,
        playerId: `${currentUserID}`,
        request: "Describe the next event in the game",
        difficulty: 2,
      });
      setStory(response);
      console.log(response);
    } catch (err) {
      setStory("Error retrieving story");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMusicPreference = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/users/email/${currentUserEmail}`
        );
        if (!res.ok) throw new Error("Failed to fetch user");
        const user = await res.json();
        setMusicEnabled(user.musicEnabled ?? true); // default to true if missing
        setNotificationsEnabled(user.notificationsEnabled ?? true);
      } catch (err) {
        console.error("Error fetching user:", err);
        setMusicEnabled(true); // fallback to true if fetch fails
        setNotificationsEnabled(true);
      }
    };

    fetchMusicPreference();
  }, [currentUserEmail]);

  useEffect(() => {
    fetchGamePoints();
  }, []);

  // Fetch again only when a new move/story is generated
  useEffect(() => {
    if (storyResponse && storyResponse !== "Awaiting your move...") {
      fetchGamePoints();
    }
  }, [storyResponse]);

  useEffect(() => {
    if (musicEnabled === false || musicEnabled === null) return;

    if (!audioRef.current) {
      const audio = new Audio(
        `/assets/audio/Track${currentTrackIndex + 1}.mp3`
      );
      audio.volume = 0.4;
      audio.currentTime = currentTime;
      audio.loop = false;
      (window as any).globalGameAudio = audio;
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    // When a track finishes, move to the next one
    const handleEnded = () => {
      const next = (currentTrackIndex + 1) % 10;
      setCurrentTrackIndex(next);
      localStorage.setItem("currentTrackIndex", String(next));
      audio.src = `/assets/audio/Track${next + 1}.mp3`;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    audio.addEventListener("ended", handleEnded);

    // 🔹 Auto play if isPlaying is true
    if (isPlaying) {
      audio
        .play()
        .catch(() => console.log("Autoplay blocked until user interaction"));
    } else {
      audio.pause();
    }

    // 🔹 Save track progress every 15 seconds
    const interval = setInterval(() => {
      if (!audio.paused) {
        localStorage.setItem("currentTrackIndex", String(currentTrackIndex));
        localStorage.setItem("currentTime", String(audio.currentTime));
        // console.log("Progress saved:", currentTrackIndex, audio.currentTime);
      }
    }, 15000);

    // 🔹 Cleanup on unmount
    return () => {
      clearInterval(interval);
      audio.removeEventListener("ended", handleEnded);
      localStorage.setItem("currentTrackIndex", String(currentTrackIndex));
      localStorage.setItem("currentTime", String(audio.currentTime));
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

  /* ---------------------- END CREATE GAME ---------------------------- */

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    // For now, hardcode the sender (later this will be the logged-in user)
    const newMessage = { sender: "You", text: chatInput.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");

    // (Later) send to backend:
    // fetch(`/api/games/${gameId}/chat`, { method: "POST", body: JSON.stringify(newMessage) })
  };
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  const [showTerritoryModal, setShowTerritoryModal] = useState(false);
  const [territoryName, setTerritoryName] = useState("N/A");

  const handleCloseModal = () => {
    setShowModal(false); // hide tutorial modal
    setTutorialCompleted(true); // mark tutorial as completed
    setTimeout(() => setShowTerritoryModal(true), 0); // show territory modal after tutorial closes
  };

  const handleTerritorySubmit = () => {
    console.log("User selected territory:", territoryName);

    // Hide the modal
    setShowTerritoryModal(false);

    // Only update if the user didn't pick N/A
    if (territoryName !== "N/A" && gameInfo) {
      // Make a copy of gameInfo so we don't mutate state directly
      const updatedGameInfo = gameInfo.map((territory: any) => {
        if (territory.territoryName === territoryName) {
          return {
            ...territory,
            ownerId: currentUserID, // Set yourself as owner
          };
        }
        return territory;
      });

      setGameInfo(updatedGameInfo);

      // Update the score for newly claimed territory
      const claimedTerritory = updatedGameInfo.find(
        (t: any) => t.territoryName === territoryName
      );
      if (claimedTerritory) {
        setScore((prevScore) => prevScore + claimedTerritory.pointValue);
      }
    }
  };
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

  useEffect(() => {
    if (!storyResponse || notificationsEnabled === false) return; // don't notify on empty initial value
    const audio = new Audio("/assets/sound_effects/notification.mp3");
    audio.play().catch((err) => {
      console.warn("Notification sound blocked by browser:", err);
    });
    // Check if the Notifications API is available
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        const notification = new Notification("Your Turn!", {
          body: "It’s your move — take your next action!",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            const notification = new Notification("Your Turn!", {
              body: "It’s your move — take your next action!",
            });
          } else {
            alert("It’s your turn — take your next action!");
          }
        });
      } else {
        alert("It’s your turn — take your next action!");
      }
    } else {
      alert("It’s your turn — take your next action!");
    }
  }, [storyResponse]);

  const [gameInfo, setGameInfo] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [winPoints, setWinPoints] = useState(30);

  async function getGameInfo(gameId: string): Promise<Record<string, any>> {
    try {
      const response = await fetch("/api/game/territories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Failed to get game info:", err);
      throw err;
    }
  }

  const [points, setPoints] = useState(0);
  const [wonGame, setWonGame] = useState(false);

  useEffect(() => {
    console.log("Player wins the game!");
  }, [wonGame]);

  const fetchGamePoints = async () => {
    const info = await getPoints(`${gameID}`);

    if (info) {
      setWinPoints(info.winningPoints || 3);
      setSummary(info.summary);
      setStatus(info.status);
    }
  };

  const handleFetchInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await getGameInfo(`${gameID}`);
      setGameInfo(info);
      console.log(info);
      let currPoints = 0;
      info.forEach((territory: any, index: number) => {
        //       console.log(`Territory #${index + 1}`);
        //       console.log("Name:", territory.territoryName);
        //       console.log("Points:", territory.pointValue);
        //       console.log("ID:", territory.territoryId);
        //       console.log("Owner:", territory.ownerId);
        //       console.log("----------------------");
        if (
          territory.ownerId !== null ||
          territory.territoryName === territoryName
        ) {
          currPoints += territory.pointValue;
        }
      });
      setScore(currPoints);
      return currPoints;
    } catch {
      setError("Failed to fetch game info.");
      setGameInfo(null);
    } finally {
      setLoading(false);
    }
  };
  async function incrementWins(email: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/wins/${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to update wins:", response.status);
        return -1;
      }

      const wins = await response.json();
      return wins; // previous number of wins (as returned by backend)
    } catch (error) {
      console.error("Error updating wins:", error);
      return -1;
    }
  }

  const [message, setMessage] = useState("🎉 Congrats on your win!");
  useEffect(() => {
    if (winPoints <= score) {
      setWonGame(true);
      const audio = new Audio("/assets/sound_effects/game_won.mp3");
      audio.play();
      const updateWins = async () => {
        const wins = await incrementWins(currentUserEmail);
        dispatch(setWins(wins));

        if (wins === 1) {
          setMessage("🎉 Congrats on your 1st win!");
        }
        if (wins === 3) {
          setMessage("🎉 Congrats on your 3rd win!");
        }
        if (wins === 10) {
          setMessage("🎉 Congrats on your 10th win!");
        }
      };
      updateWins();
    }
  }, [winPoints, score]);

  // narration
  useEffect(() => {
    handleFetchInfo();
    fetchGamePoints();
    console.log("winPoints: " + winPoints);
    console.log("Score: " + score);
    if (storyResponse && storyResponse !== "Awaiting your move...") {
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

  //
  useEffect(() => {
    sessionStartRef.current = new Date();

    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000); // increment every second

    return () => {
      // Cleanup — stop timer
      clearInterval(interval);

      if (sessionStartRef.current) {
        const sessionEnd = new Date();
        const durationMs =
          sessionEnd.getTime() - sessionStartRef.current.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        console.log(
          `User spent ${durationHours.toFixed(2)} hours on Game page`
        );

        if (currentUserEmail) {
          savePlaytime(currentUserEmail, durationHours);
        }
      }
    };
  }, []);

  const savePlaytime = async (email: string, hours: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/totalPlayTime/${email}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hours }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to increment totalPlayTime:",
          response.statusText
        );
      } else {
        const data = await response.json();
        console.log(
          "✅ Incremented totalPlayTime:",
          data.totalPlayTime.toFixed(3),
          "hours total"
        );
      }
    } catch (error) {
      console.error("Error updating totalPlayTime:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflowX: "auto",
        overflowY: "auto",
        backgroundColor: "bisque",
      }}
    >
      {/* ✅ Navbar fixed top */}
      <Navbar />

      {/* ✅ Top bar (score + music) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: musicEnabled ? "space-between" : "center",
          alignItems: "center",
          width: "40%",
          maxWidth: "1400px",
          height: "10vh",
          margin: "0 auto",
          mt: 10,
          px: 2,
        }}
      >
        {/* Scoreboard */}
        <Box
          sx={{
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "12px", // match music box radius
            px: 2,
            py: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            color: "white",
            backdropFilter: "blur(4px)", // same subtle blur
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)", // match drop shadow
            width: "35%", // same sizing logic
            gap: "8px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              textShadow: "0px 0px 6px rgba(0,0,0,0.4)",
              textAlign: "center",
            }}
          >
            {score} / {winPoints}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(score / winPoints) * 100}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "rgba(227, 125, 0, 0.5)",
              "& .MuiLinearProgress-bar": { backgroundColor: "rgb(207,78,10)" },
            }}
          />
        </Box>

        <div style={{ padding: "1rem" }}>
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
            Enable Notifications?
          </label>
        </div>

        {/* Music box */}
        {musicEnabled && (
          <Box
            sx={{
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: "12px",
              px: 2,
              py: 2,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "white",
              backdropFilter: "blur(4px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
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
      </Box>

      {/* ✅ Middle section (chat + map + story) */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center", // centers vertically in the row
          width: "100%",
          overflowX: "auto",
        }}
      >
        {/* Left Chat Box */}
        <Box
          sx={{
            flex: "0 0 20%",
            height: "75%",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "20px",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "4px 4px 10px rgba(0,0,0,0.3)",
            marginLeft: "40px",
          }}
        >
          {/* Title row with mute button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Game Chat
            </Typography>

            {/* Mute button */}
            <button
              onClick={handleMuteToggle}
              style={{
                backgroundColor: isMuted
                  ? "rgba(255, 0, 0, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
          </Box>

          {/* Scrollable message area */}
          <Box
            id="chat-messages"
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              fontSize: "0.9rem",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              mb: 1,
            }}
          >
            {!isMuted && (
              <>
                {messages.length === 0 ? (
                  <Typography
                    sx={{
                      opacity: 0.6,
                      color: "lightgray",
                      fontSize: "0.7rem",
                      lineHeight: 1.4,
                    }}
                  >
                    No messages yet...
                  </Typography>
                ) : (
                  messages.map((msg, i) => (
                    <Box
                      key={i}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        p: "4px 6px",
                        wordBreak: "break-word",
                      }}
                    >
                      <strong style={{ color: "rgb(207,78,10)" }}>
                        {msg.sender}:
                      </strong>{" "}
                      {msg.text}
                    </Box>
                  ))
                )}
              </>
            )}
          </Box>

          {/* Input + send button */}
          <Box sx={{ display: "flex", gap: "5px" }}>
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
                color: "white",
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                border: "none",
                borderRadius: "6px",
                backgroundColor: "rgb(207,78,10)",
                color: "white",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </Box>
        </Box>

        {/* Center Map */}
        <Box
          sx={{
            flex: "1 1 60%",
            display: "flex",
            alignItems: "center", // centers map vertically within its space
            justifyContent: "center",
            height: "100%", // fill vertical space evenly
            transform: "scale(0.9)",
            transformOrigin: "center",
            marginLeft: "-70px",
            marginRight: "-30px",
          }}
        >
          {map === "USA" && (
            <InteractiveUSMap gameInfo={gameInfo} start={territoryName} />
          )}
          {map === "Medieval Europe" && <Europe />}
        </Box>

        {/* Right Story Box */}
        <Box
          sx={{
            flex: "0 0 20%",
            height: "75%",
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: "20px",
            marginRight: "40px",
            p: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "-4px 4px 10px rgba(0,0,0,0.3)",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 1, color: "white", fontWeight: "bold" }}
          >
            Story Board
          </Typography>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              fontSize: "0.8rem",
              textAlign: "justify",
              color: "white",
            }}
          >
            <Typography
              sx={{ color: "lightgray", fontSize: "0.7rem", lineHeight: 1.4 }}
            >
              {storyResponse || "Awaiting your move..."}
            </Typography>
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
        </Box>
      </Box>

      {/* ✅ Player action input (bottom) */}
      <Box
        sx={{
          height: "10vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PlayerActionInput
          gameId={gameID!}
          playerId={currentUserID!}
          onSubmitResponse={setStoryResponse}
        />
      </Box>

      {/* ✅ Win screen overlay */}
      {wonGame && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            color: "white",
            backdropFilter: "blur(5px)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "rgb(207,78,10)",
              textShadow: "0 0 12px rgba(207,78,10,0.8)",
              mb: 2,
            }}
          >
            Game Won!
          </Typography>

          <Typography
            variant="h5"
            sx={{ mb: 4, maxWidth: "600px", lineHeight: 1.5 }}
          >
            {summary}
          </Typography>

          <Box sx={{ width: "60%", mb: 4 }}>
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                height: 14,
                borderRadius: 7,
                backgroundColor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "rgb(207,78,10)",
                },
              }}
            />
          </Box>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "rgb(207,78,10)",
              "&:hover": { backgroundColor: "darkorange" },
              px: 4,
              py: 1,
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
            onClick={() => navigate("/home")}
          >
            Home
          </Button>
          <WinPopup wonGame={wonGame} message={message} />
        </Box>
      )}

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

      {/* Territory Selection Modal */}
      {showTerritoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Select Your Starting Territory</h2>
            <p>Please select the territory you would like to start at:</p>

            <select
              value={territoryName}
              onChange={(e) => setTerritoryName(e.target.value)}
              style={{ padding: "6px", borderRadius: "4px", width: "80%" }}
            >
              <option value="N/A">N/A</option>
              {gameInfo?.map((territory, index) => (
                <option key={index} value={territory.territoryName}>
                  {territory.territoryName}
                </option>
              ))}
            </select>

            <button
              onClick={handleTerritorySubmit}
              style={{ marginTop: "10px" }}
              disabled={!territoryName} // optional: prevent submit without selection
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </Box>
  );
}

export default Game;
