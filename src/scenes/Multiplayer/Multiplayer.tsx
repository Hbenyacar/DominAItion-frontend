import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InteractiveUSMap from "../../widgets/Maps/USA/USA";
import PlayerActionInput from "../../widgets/PlayerActionInput/PlayerActionInput";
import HelpTooltip from "../../components/HelpTooltip";
import { Box, IconButton, Tooltip, Typography, Button, Divider } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { playSound } from "../../utils/sound";
import { keyframes } from "@mui/system";

const pointGlow = keyframes`
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  30% {
    transform: scale(1.05);
    opacity: 1;
  }
  60% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

interface GameInfo {
  id: string;
  worldId: string;
  playerIds: string[];
  territories: { territoryName: string; ownerId: string | null }[];
  status: string;
  createdAt: string;
  turn: number;
  startingTerritory?: string;
  [key: string]: any;
  storyboard: string;
  chat: ChatMessage[];
  playerPoints: Record<string, number>;
  winningPoints: number;
}

interface ChatMessage {
  _id: string;
  chatId: string;
  contents: string;
  senderName: string;
  color: string;
  isRead: boolean;
}

interface Player {
  id: string;
  name: string;
  color: string;
}

interface BoardSnapshot {
  turn: number;
  territories: GameInfo["territories"];
  storyboard: string;
  playerPoints: GameInfo["playerPoints"];
  createdAt: string; // when we stored this snapshot (client-side)
}

async function getInfo(gameId: string | undefined) {
  try {
    const response = await fetch("/api/game/getInfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });

    if (!response.ok) {
      console.error("Failed to fetch game info:", response.statusText);
      return null;
    }
    return (await response.json()) as GameInfo;
  } catch (error) {
    console.error("Error fetching game info:", error);
    return null;
  }
}

async function sendMessage(
  gameId: string,
  name: string,
  contents: string,
  color: string
): Promise<Record<string, any>> {
  try {
    const response = await fetch("/api/game/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, name, contents, color }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response;
  } catch (err) {
    console.error("Failed to get game info:", err);
    throw err;
  }
}

async function sendWinRequest(gameId: string | undefined, winnerId: string) {
  try {
    await fetch("/api/game/win", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, winnerId }),
    });
  } catch (err) {
    console.error("Failed to send win request:", err);
  }
}


function checkWinner(gameInfo: GameInfo, gameId: string | undefined) {
  const { playerPoints, winningPoints } = gameInfo;
  console.log('In Check Win');
  console.log('gameId: ' + gameId);
  // Find the first player who reached winning points
  for (const [playerId, points] of Object.entries(playerPoints)) {
    if (points >= 2) {
      // Return the winner's ID
      sendWinRequest(gameId, playerId);
      return playerId;
    }
  }

  // No winner yet
  return null;
}


function Multiplayer() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [boardHistory, setBoardHistory] = useState<BoardSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [hasPlayedLoseSound, setHasPlayedLoseSound] = useState(false);
  const [hasPlayedWinSound, setHasPlayedWinSound] = useState(false);
  const [justScored, setJustScored] = useState(false);
  const [scoredTerritory, setScoredTerritory] = useState<string | null>(null);
  const [spectators, setSpectators] = useState<Player[]>([]);
  const prevGameInfoRef = useRef<GameInfo | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const prevChatLengthRef = useRef<number | null>(null);

  const getPlayerColor = (index: number) => {
    const colors = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFA500",
      "#800080",
      "#00FFFF",
    ];
    return colors[index % colors.length];
  };

  const getCurrentUserColor = () => {
    const player = players.find((p) => p.id === currentUser.id);
    return player ? player.color : "#FFFFFF"; // fallback
  };

  useEffect(() => {
    if (!gameId) return;

    const loadGame = async () => {
      const info = await getInfo(gameId);
      if (!info) return;

      setGameInfo(info);
      console.log(info);

      const mapped = info.playerIds.map((id, index) => ({
        id,
        name: info.playerNames?.[id] || `Player ${index + 1}`,
        color: getPlayerColor(index),
      }));

      // ⭐ NEW: Log the colors so you see exactly what is being passed
      console.log(
        "Player colors:",
        mapped.map((p) => ({ id: p.id, color: p.color }))
      );

      setPlayers(mapped);
    };

    loadGame();

    // --- WebSocket Connection ---
    const socket = new SockJS("/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      onConnect: () => {
        console.log("Connected to WS for game", gameId);

        // Subscribe to refresh topic
        stompClient.subscribe(`/topic/game/${gameId}/refresh`, (msg) => {
          console.log("🔄 Refresh signal received!");

          setTimeout(() => {
            window.location.reload();
          }, 300); // ⏳ delay 2 seconds
        });
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [gameId]);

  // Load existing history from localStorage for this game
  useEffect(() => {
    if (!gameId) return;

    const key = `boardHistory_${gameId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BoardSnapshot[];
        setBoardHistory(parsed);
      } catch (e) {
        console.error("Failed to parse board history", e);
      }
    }
  }, [gameId]);

  // save history to localStorage whenever it changes
  useEffect(() => {
    if (!gameId) return;
    const key = `boardHistory_${gameId}`;
    localStorage.setItem(key, JSON.stringify(boardHistory));
  }, [boardHistory, gameId]);

  // whenever gameInfo updates, append snapshot of board
  useEffect(() => {
    if (!gameInfo) return;

    setBoardHistory((prev) => {
      const last = prev[prev.length - 1];

      // Avoid duplicates if we already stored this turn
      if (last && last.turn === gameInfo.turn) return prev;

      const snapshot: BoardSnapshot = {
        turn: gameInfo.turn,
        territories: gameInfo.territories,
        storyboard: gameInfo.storyboard,
        playerPoints: gameInfo.playerPoints,
        createdAt: new Date().toISOString(),
      };

      const updated = [...prev, snapshot];
      return updated;
    });
  }, [gameInfo]);

  useEffect(() => {
    if (!gameInfo || !currentUser) return;

    const prev = prevGameInfoRef.current;
    if (prev) {
      const prevPoints = prev.playerPoints?.[currentUser.id] ?? 0;
      const newPoints = gameInfo.playerPoints?.[currentUser.id] ?? 0;

      // ⚡ user just gained at least 1 point
      if (newPoints > prevPoints) {
        // figure out which territory/ies are new for this user
        const prevOwned = new Set(
          prev.territories
            .filter((t) => t.ownerId === currentUser.id)
            .map((t) => t.territoryName)
        );

        const newOwned = gameInfo.territories
          .filter((t) => t.ownerId === currentUser.id)
          .map((t) => t.territoryName);

        const newlyGained =
          newOwned.find((name) => !prevOwned.has(name)) ?? null;

        setScoredTerritory(newlyGained);
        setJustScored(true);

        // optional: play separate “point gained” sound
        try {
          playSound("/assets/sound_effects/point_gain.mp3");
        } catch (e) {
          console.error("Failed to play point-gain sound", e);
        }

        // auto-hide animation after ~1.2s
        setTimeout(() => {
          setJustScored(false);
          setScoredTerritory(null);
        }, 1200);
      }
    }

    // always update ref at the end
    prevGameInfoRef.current = gameInfo;
  }, [gameInfo, currentUser]);

  // lose sound
  useEffect(() => {
    if (!gameInfo || !currentUser) return;

    const winnerId = checkWinner(gameInfo, gameId);
    if (!winnerId) return; // no winner yet

    // If I am NOT the winner, and we haven't already played the sound
    if (winnerId !== currentUser.id && !hasPlayedLoseSound) {
      try {
        playSound("/assets/sound_effects/game_lost.mp3");
        setHasPlayedLoseSound(true);
      } catch (e) {
        console.error("Failed to play lose sound", e);
      }
    }
  }, [gameInfo, currentUser, hasPlayedLoseSound]);

  // win sound
  useEffect(() => {
    if (!gameInfo || !currentUser) return;

    const winnerId = checkWinner(gameInfo, gameId);
    if (!winnerId) return; // no winner yet

    // 🏆 If I am the winner and we haven't played win sound yet
    if (winnerId === currentUser.id && !hasPlayedWinSound) {
      try {
        playSound("/assets/sound_effects/game_won.mp3");
        setHasPlayedWinSound(true);
      } catch (e) {
        console.error("Failed to play win sound", e);
      }
    }
  }, [gameInfo, currentUser, hasPlayedWinSound]);

  useEffect(() => {
    if (!gameId || !currentUser) return;
      refreshSpectators();
  }, [gameId, currentUser]);

  useEffect(() => {
  if (gameInfo) {
    setSpectators(gameInfo.spectators ?? []);
  }
}, [gameInfo]); // <-- critical!

  const refreshSpectators = async () => {
    if (!gameId) return;

    try {
      const response = await fetch(`/api/game/spectators/names/${gameId}`);
      if (!response.ok) {
        console.error("Failed to fetch spectator names:", response.statusText);
        return;
      }

      const data: Record<string, string> = await response.json();

      // Convert to Player[] with gray color for spectators
      const updatedSpectators: Player[] = Object.entries(data).map(([id, name]) => ({
        id,
        name,
        color: "#888",
      }));
      const uniqueSpectators = Array.from(
        new Map(updatedSpectators.map(s => [s.id, s])).values()
      );
      setSpectators(uniqueSpectators);
    } catch (err) {
      console.error("Error refreshing spectators:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedText(inputValue);
    setInputValue("");
  };

  const handleSend = () => {
    const result = sendMessage(
      gameId!,
      currentUser.username,
      inputValue,
      getCurrentUserColor()
    );
    console.log(result);
  };

  const winnerId = gameInfo ? checkWinner(gameInfo, gameId) : null;
  const winnerName = winnerId ? gameInfo?.playerNames?.[winnerId] : null;

  const activeSnapshot =
    historyIndex !== null && boardHistory[historyIndex]
      ? boardHistory[historyIndex]
      : null;

  const territoriesToRender =
    activeSnapshot?.territories ?? gameInfo?.territories ?? [];

  const storyboardToRender =
    activeSnapshot?.storyboard ?? gameInfo?.storyboard ?? "";

  const turnLabel = activeSnapshot?.turn ?? gameInfo?.turn;
  const isHistoryMode = historyIndex !== null;

  return (
    <div style={{ padding: "20px" }}>
      {!gameInfo ? (
        <p>Loading game...</p>
      ) : (
        <Box>
          <Typography>
            Player: {players[gameInfo.turn % players.length].id}
          </Typography>

          {/* Player Points Vertical Bars */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mb: 2,
              alignItems: "center", // center the bars horizontally
            }}
          >
            {players.map((player) => {
              const playerPoints = gameInfo.playerPoints[player.id] ?? 0;
              const widthPercent =
                (playerPoints / gameInfo.winningPoints) * 100;

              const playerName = gameInfo.playerNames[player.id] ?? player.name;

              const isCurrentUser = player.id === currentUser.id;

              return (
                <Box
                  key={player.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      width: "100px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: player.color,
                      textAlign: "right",
                    }}
                  >
                    {playerName}
                  </Typography>

                  <Box
                    sx={{
                      height: "20px",
                      width: "250px",
                      backgroundColor: "#555",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${widthPercent}%`,
                        backgroundColor: player.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        px: 1,
                        fontSize: "12px",
                        color: "white",
                        fontWeight: 600,

                        // 🔥 smooth grow/shrink whenever points change
                        transition: "width 0.4s ease-out",

                        // ✨ optional: glow animation when *you* just scored
                        animation: isCurrentUser
                          ? `${pointGlow} 0.9s ease-out`
                          : "none",
                        transformOrigin: "left center",
                      }}
                    >
                      {widthPercent >= 10 ? playerPoints : ""}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

{/* Players List and Spectators */}
<Box
  sx={{
    width: "250px",
    maxHeight: "250px",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: "12px",
    padding: 2,
    overflowY: "hidden", // remove scroll from outer box
    marginBottom: 2,
  }}
>
  {/* Players */}
  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
    Players
  </Typography>
  <Box
    sx={{
      maxHeight: "200px", // fixed height for players list
      overflowY: "auto",  // scrollable if list is too long
      mb: 1,
    }}
  >
    {players.map((p) => (
      <Box
        key={p.id}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 0.5,
          padding: "4px 8px",
          borderRadius: "8px",
          backgroundColor: p.id === currentUser?.id ? "rgba(255,255,255,0.2)" : "transparent",
        }}
      >
        <Box
          sx={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: p.color,
          }}
        />
        <Typography sx={{ fontSize: "14px", color: "white" }}>{p.name}</Typography>
      </Box>
    ))}
  </Box>

  <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.5)" }} />

  {/* Spectators */}
  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
    Spectators
  </Typography>
  <button
    onClick={refreshSpectators}
    style={{
      padding: "2px 6px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
    }}
  >
    Refresh
  </button>
  <Box
    sx={{
      maxHeight: "200px", // fixed height for spectators list
      overflowY: "auto",  // scrollable if list is too long
      mt: 1,
    }}
  >
    {spectators.map((s) => (
      <Box
        key={s.id}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 0.5,
          padding: "4px 8px",
          borderRadius: "8px",
        }}
      >
        <Box
          sx={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#888",
          }}
        />
        <Typography sx={{ fontSize: "14px", color: "white" }}>{s.name}</Typography>
      </Box>
    ))}
  </Box>
</Box>

          {/* Center box, holds chat, map, story */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Box
              sx={{
                width: "200px",
                height: "400px",
                backgroundColor: "rgba(0,0,0,0.3)",
                borderRadius: "20px",
                marginRight: "40px",
                p: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                boxShadow: "-4px 4px 10px rgba(0,0,0,0.3)",
              }}
            >
              {/* Chat messages */}
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
  <HelpTooltip description="This is the in-game chat. Send messages to other players here." />
</Box>
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  paddingRight: "6px",
                }}
              >
                {gameInfo.chat?.map((msg, idx) => (
                  <Box key={idx} sx={{ marginBottom: "8px" }}>
                    <Box
                      key={idx}
                      sx={{ marginBottom: "8px", display: "flex", gap: 1 }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: msg.color,
                        }}
                      >
                        {msg.senderName}:
                      </span>
                      <span style={{ fontSize: "13px", color: "white" }}>
                        {msg.contents}
                      </span>
                    </Box>
                  </Box>
                ))}
              </Box>

 <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
    <HelpTooltip description="Type your chat messages here. Press Enter to send." />
  </Box>
              {/* Input area */}
              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                
                <Box sx={{ display: "flex", gap: 1 }}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type something..."
                    style={{
                      padding: "8px",
                      width: "100%",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <button
                    type="submit"
                    onClick={() => {
                      handleSend();
                      playSound("/assets/sound_effects/chat_noti.mp3");
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Send
                  </button>
                </Box>
              </form>
            </Box>

            {/* center - map */}
            
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
              <Box
  sx={{
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  }}
>
  <HelpTooltip description="This is the game map showing the ownership status of each territory." />
</Box>
              <InteractiveUSMap
                territories={territoriesToRender}
                players={players}
                start={gameInfo.startingTerritory}
              />
            </Box>

            {/* Full-screen Game Over / Win overlay */}
            {winnerName && (
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
                  textAlign: "center",
                  backdropFilter: "blur(5px)",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    color:
                      winnerId === currentUser.id
                        ? "rgb(207, 255, 120)"
                        : "rgb(255, 180, 120)",
                    textShadow: "0 0 12px rgba(0,0,0,0.8)",
                    mb: 2,
                  }}
                >
                  {winnerId === currentUser.id ? "You Won!" : "Game Over"}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{ mb: 4, maxWidth: 600, lineHeight: 1.5 }}
                >
                  {winnerId === currentUser.id
                    ? "Your domination is complete. The world is yours."
                    : `${winnerName} has conquered the world this time.`}
                </Typography>

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
                  Back to Home
                </Button>
              </Box>
            )}

            {/* right - story board */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Storyboard
              </Typography>

              
              <Box
                sx={{
                  width: "300px",
                  height: "400px",
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
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
  <HelpTooltip description="This shows the evolving story and events of the game. Scroll to view history." />
</Box>
                {/* Scrollable storyboard text */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    pr: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line", color: "white" }}
                  >
                    {storyboardToRender}
                  </Typography>
                </Box>

                {/* Bottom nav: left / right history buttons */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  {/* LEFT: previous turn */}
                  <IconButton
                    size="small"
                    sx={{ color: "white" }}
                    disabled={boardHistory.length <= 1}
                    onClick={() => {
                      if (boardHistory.length <= 1) return;

                      setHistoryIndex((prev) => {
                        // from live -> jump to most recent *previous* snapshot
                        if (prev === null) {
                          return boardHistory.length > 1
                            ? boardHistory.length - 2
                            : null;
                        }
                        // already in history -> step back if possible
                        if (prev > 0) return prev - 1;
                        return prev;
                      });
                    }}
                  >
                    <ArrowBack />
                  </IconButton>

                  {/* Middle label: which turn / mode */}
                  <Typography variant="caption" sx={{ color: "white" }}>
                    {turnLabel !== undefined
                      ? isHistoryMode
                        ? `Turn ${turnLabel} (history)`
                        : `Turn ${turnLabel} (live)`
                      : "No turn info"}
                  </Typography>

                  {/* RIGHT: next turn / go back to live */}
                  <IconButton
                    size="small"
                    sx={{ color: "white" }}
                    disabled={boardHistory.length <= 1}
                    onClick={() => {
                      if (boardHistory.length <= 1) return;

                      setHistoryIndex((prev) => {
                        // if we're live, nothing to "go forward" to
                        if (prev === null) return prev;

                        // if there is another historical snapshot ahead, move forward
                        if (prev < boardHistory.length - 2) {
                          return prev + 1;
                        }

                        // if we were on the last historical snapshot (length - 2),
                        // going forward brings us back to live
                        return null;
                      });
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            
          </Box>

          {/* Bottom text box*/}
          {players[gameInfo.turn % players.length] && (
            <>
            <Box
      sx={{
        position: "absolute",
        bottom: 100, // adjust based on where PlayerActionInput sits
        right: 20,
        zIndex: 1000,
      }}
    >
    </Box>
            <PlayerActionInput
              gameId={gameId!}
              playerId={players[gameInfo.turn % players.length].id}
              userId={currentUser.id}
              color={players[gameInfo.turn % players.length].color}
              onSubmitResponse={(response: string) =>
                setSubmittedText(response)
              }
            />
            </>
          )}
        </Box>
        
        
      )}
            <HelpTooltip description="This is your action input. Enter your moves or commands for your turn here." />

      
    </div>
  );
}

export default Multiplayer;
