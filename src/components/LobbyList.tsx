import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// Types
export interface User {
  id: string;
  username: string;
}

export interface Lobby {
  id: string;
  map: string;
  code: string;
  users: User[];
}

// --- Lobby Card Component ---
interface LobbyCardProps {
  lobby: Lobby;
  onJoin: (lobbyId: string) => void;
}

const LobbyCard = ({ lobby, onJoin }: LobbyCardProps) => {
  return (
    <Card
      onClick={() => onJoin(lobby.id)}
      sx={{
        cursor: "pointer",
        bgcolor: "success.main",
        color: "white",
        "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div" fontWeight={600}>
          {lobby.map} Arena
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Game Code: {lobby.code}
        </Typography>
        <Typography variant="body1">
          Players: {lobby.users.length}
        </Typography>
      </CardContent>
    </Card>
  );
};

// --- Join by Game Code Component ---
interface GameCodeSearchProps {
  onJoinByCode: (code: string) => Promise<boolean>;
}

const GameCodeSearch = ({ onJoinByCode }: GameCodeSearchProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!code.trim()) {
      setError("Please enter a game code");
      return;
    }
    const found = await onJoinByCode(code.trim());
    if (!found) {
      setError("No lobby found with that game code");
    } else {
      setError("");
    }
  };

  return (
    <Stack direction="column" spacing={2} mb={4} alignItems="center" width="100%">
      <Stack direction="row" spacing={2} width="100%" maxWidth={400}>
        <TextField
          fullWidth
          variant="outlined"
          label="Enter Game Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button
          variant="contained"
          color="success"
          onClick={handleJoin}
          sx={{ whiteSpace: "nowrap" }}
        >
          Join Lobby
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ width: "100%", maxWidth: 400 }}>{error}</Alert>}
    </Stack>
  );
};

// --- Main Lobby List Component ---
function LobbyList() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLobbies = async () => {
      const data = await getAllLobbies();
      setLobbies(data);
    };

    fetchLobbies();
    const interval = setInterval(fetchLobbies, 10000);
    return () => clearInterval(interval);
  }, []);

  const getAllLobbies = async (): Promise<Lobby[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lobby`);
      if (!response.ok) {
        console.error("Failed to fetch lobbies:", response.statusText);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching lobbies:", error);
      return [];
    }
  };

  const handleJoin = (lobbyId: string) => {
    navigate(`/lobby/${lobbyId}`);
  };

  const handleJoinByCode = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lobby/code/${code}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.log('Not Ok');
        return false;
      }


      const lobby = await response.json();
      if (lobby?.id) {
        navigate(`/lobby/${lobby.id}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error searching lobby by code:", error);
      return false;
    }
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
      <Typography variant="h4" fontWeight={600} color="success.main" mb={2}>
        Available Lobbies
      </Typography>

      {/* Text field + button for game code */}
      <GameCodeSearch onJoinByCode={handleJoinByCode} />

      {lobbies.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No lobbies found.
        </Typography>
      ) : (
        <Stack spacing={2} width="100%" maxWidth={600}>
          {lobbies.map((lobby) => (
            <LobbyCard key={lobby.id} lobby={lobby} onJoin={handleJoin} />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default LobbyList;
