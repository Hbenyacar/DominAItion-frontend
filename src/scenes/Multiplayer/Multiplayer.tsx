import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InteractiveUSMap from "../../widgets/Maps/USA/USA";
import PlayerActionInput from "../../widgets/PlayerActionInput/PlayerActionInput";
import { Box, Typography } from "@mui/material";

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

function Multiplayer() {
  const { gameId } = useParams<{ gameId: string }>();
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [submittedText, setSubmittedText] = useState("");

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
  }, [gameId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedText(inputValue);
    setInputValue("");
  };

  return (
    <div style={{ padding: "20px" }}>
      {!gameInfo ? (
        <p>Loading game...</p>
      ) : (
        <Box>
          <Typography>
            Player: {players[gameInfo.turn % players.length].id}
          </Typography>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              width: "100%",
              overflowX: "auto",
            }}
          >
            {/* left - chat box */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Game Chat
              </Typography>

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
                {submittedText || "Nothing submitted yet."}
              </Box>
            </Box>
          </Box>

          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              border: "1px solid #ddd",
              width: "320px",
              backgroundColor: "#eef",
            }}
          >
            <strong>Game Status:</strong> {gameInfo.status}
          </div>
          {players[gameInfo.turn % players.length] && (
            <PlayerActionInput
              gameId={gameId!}
              playerId={players[gameInfo.turn % players.length].id}
              onSubmitResponse={(response: string) =>
                setSubmittedText(response)
              }
            />
          )}
        </Box>
      )}
    </div>
  );
}

export default Multiplayer;
