import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InteractiveUSMap from "../../widgets/Maps/USA/USA";
import PlayerActionInput from "../../widgets/PlayerActionInput/PlayerActionInput";

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
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFA500", "#800080", "#00FFFF"];
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
    console.log("Player colors:", mapped.map(p => ({ id: p.id, color: p.color })));

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
        <>
        <div>Player {players[gameInfo.turn % players.length].id}</div>
          <InteractiveUSMap
            territories={gameInfo.territories ?? []}
            players={players}
            start={gameInfo.startingTerritory}
          />

          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type something..."
              style={{ padding: "5px", width: "300px" }}
            />
            <button type="submit" style={{ marginLeft: "10px", padding: "5px 10px" }}>
              Submit
            </button>
          </form>

          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #ccc",
              width: "320px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {submittedText || "Nothing submitted yet."}
          </div>

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
              onSubmitResponse={(response: string) => setSubmittedText(response)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Multiplayer;
