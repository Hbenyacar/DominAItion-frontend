import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";

interface Message {
  senderName?: string;
  color?: string;
  contents: string;
  storyResponse?: string;
  time?: string;
}

interface Game {
  id: string;
  worldId: string;
  status: string;
  winningPoints: number;
  playerPoints: Record<string, number>;
  summary?: string;
  gameLog: Message[];
  winnerId?: string;
  dateCreated?: string;
}

interface SavedGamesListProps {
  userId: string;
}

const SavedGamesList: React.FC<SavedGamesListProps> = ({ userId }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSavedGames = async () => {
    try {
      const res = await fetch("/api/users/savedGames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data: Game[] = await res.json();
      console.log(data);
      setGames(data || []);
    } catch (error) {
      console.error("Error fetching saved games:", error);
      setGames([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSavedGames();
  }, []);

  const openGame = (gameId: string) => {
    navigate(`/multiplayer/${gameId}`);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Saved Games
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : games.length === 0 ? (
        <Typography>No saved games found.</Typography>
      ) : (
        games.map((game) => (
          <Card
            key={game.id}
            sx={{
              mb: 2,
              cursor: "pointer",
              border: "1px solid #ccc",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
            onClick={() => openGame(game.id)}
          >
            <CardContent>
              {/* USA Image Added Here */}
              <img
                src={process.env.PUBLIC_URL + "/images/usa_map.png"}
                alt="USA Map"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  marginBottom: "10px",
                  borderRadius: "8px",
                }}
              />

              <Typography variant="subtitle1">
                <strong>Game ID:</strong> {game.id}
              </Typography>
              <Typography variant="body2">
                <strong>Winning Points:</strong> {game.winningPoints}
              </Typography>
              <Typography variant="body2">
                <strong>Date created:</strong> {game.dateCreated || "N/A"}
              </Typography>

              {game.summary && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Summary:</strong> {game.summary}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default SavedGamesList;
