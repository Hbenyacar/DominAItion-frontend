import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography
} from "@mui/material";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

interface Game {
  id: string;
  status: string;
  winningPoints: number;
  turn: number;
  playerIds: string[];
}

interface GameCardProps {
  game: Game;
  onSelect: (gameId: string) => void;
}

const GameCard = ({ game, onSelect }: GameCardProps) => {
  return (
    <Card
      onClick={() => onSelect(game.id)}
      sx={{
        cursor: "pointer",
        bgcolor: "primary.main",
        color: "white",
        "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          Game USA
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Status: {game.status}
        </Typography>
        <Typography variant="body1">
          Players: {game.playerIds?.length ?? 0}
        </Typography>
        <Typography variant="body1">
          Turn: {game.turn}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function SpectateList() {
  const [games, setGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/game/active`);
        if (!response.ok) {
          console.error("Failed to fetch games:", response.statusText);
          return;
        }
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchGames();
    const interval = setInterval(fetchGames, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (gameId: string) => {
    navigate(`/spectate/${gameId}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 3,
      }}
    >
      <Typography variant="h4" fontWeight={600} color="primary.main" mb={2}>
        Spectate Games
      </Typography>

      {games.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No active games available.
        </Typography>
      ) : (
        <Stack spacing={2} width="100%" maxWidth={600}>
          {games.map((game) => (
            <GameCard key={game.id} game={game} onSelect={handleSelect} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
