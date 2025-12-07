import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InteractiveUSMap from "../../widgets/Maps/USA/USA";
import PlayerActionInput from "../../widgets/PlayerActionInput/PlayerActionInput";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";


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

async function sendMessage(gameId: string, name: string, contents: string, color: string): Promise<Record<string, any>> {
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

function checkWinner(gameInfo: GameInfo) {
  const { playerPoints, winningPoints } = gameInfo;

  // Find the first player who reached winning points
  for (const [playerId, points] of Object.entries(playerPoints)) {
    if (points >= winningPoints) {
      // Return the winner's ID
      return playerId;
    }
  }

  // No winner yet
  return null;
}


function Spectate() {
  const { gameId } = useParams<{ gameId: string }>();
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const currentUser = useSelector((state: RootState) => state.auth.user);
  

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
        name: `Player ${index + 1}`,
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
        window.location.reload();   // ⬅️ RELOAD ENTIRE PAGE
      });
    },
  });

  stompClient.activate();

  return () => {
    stompClient.deactivate();
  };
  }, [gameId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedText(inputValue);
    setInputValue("");
  };

  const handleSend = () => {
    const result = sendMessage(gameId!, "(Spectator) " + currentUser.username, inputValue, "#000000");
    console.log(result);
  }

  const winnerId = gameInfo ? checkWinner(gameInfo) : null;
  const winnerName = winnerId ? gameInfo?.playerNames?.[winnerId] : null;

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
    const totalPoints =
      Object.values(gameInfo.playerPoints).reduce((a, b) => a + (b as number), 0) || 1;
    const widthPercent = (playerPoints / gameInfo.winningPoints) * 100;

    // Get actual username from backend response
    const playerName = gameInfo.playerNames[player.id] ?? player.name;

    return (
      <Box
        key={player.id}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%", // allows centering child
          justifyContent: "center",
        }}
      >
        {/* Player name on the left */}
        <Typography
          sx={{
            width: "100px", // fixed width for names
            fontSize: "12px",
            fontWeight: 600,
            color: player.color,
            textAlign: "right",
          }}
        >
          {playerName}
        </Typography>

        {/* Bar */}
        <Box
          sx={{
            height: "20px",
            width: "250px", // wider bar
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
            }}
          >
            {widthPercent >= 10 ? playerPoints : ""}
          </Box>
        </Box>
      </Box>
    );
  })}
</Box>



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
        <Box key={idx} sx={{ marginBottom: "8px", display: "flex", gap: 1 }}>
  <span style={{ fontSize: "12px", fontWeight: 600, color: msg.color }}>
    {msg.senderName}:
  </span>
  <span style={{ fontSize: "13px", color: "white" }}>
    {msg.contents}
  </span>
</Box>

      </Box>
    ))}
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
        onClick={handleSend}
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
              <InteractiveUSMap
                territories={gameInfo.territories ?? []}
                players={players}
                start={gameInfo.startingTerritory}
              />
            </Box>

            {winnerName && (
  <Box
    sx={{
      width: "100%",
      textAlign: "center",
      padding: "10px 0",
      backgroundColor: "#FFD700",
      borderRadius: "10px",
      marginBottom: "20px",
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      🎉 {winnerName} wins the game! 🎉
    </Typography>
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
                  overflowY: "auto",
                }}
              >
                {gameInfo.storyboard}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </div>
  );
}

export default Spectate;
