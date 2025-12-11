import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from "@mui/material";

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
}

interface HistoryPopupProps {
  userId: string;
}

const HistoryPopup: React.FC<HistoryPopupProps> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data: Game[] = await res.json();
      setHistory(data || []); // ensure an array is always set
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    fetchHistory();
  };

  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="contained" onClick={handleOpen}>
        Show Game History
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Game History</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : history.length === 0 ? (
            <Typography>No games found for this user.</Typography>
          ) : (
            history.map((game) => (
              <Box key={game.id} sx={{ mb: 3, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
                <Typography variant="subtitle1"><strong>Game ID:</strong> {game.id}</Typography>
                <Typography variant="body2"><strong>World:</strong> {game.worldId}</Typography>
                <Typography variant="body2"><strong>Status:</strong> {game.status}</Typography>
                <Typography variant="body2"><strong>Winning Points:</strong> {game.winningPoints}</Typography>
                <Typography variant="body2"><strong>Winner:</strong> {game.winnerId || "N/A"}</Typography>
                {game.summary && <Typography variant="body2"><strong>Summary:</strong> {game.summary}</Typography>}

                <Box mt={1} p={1} sx={{ backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="subtitle2">Game Log:</Typography>
                  {game.gameLog.length === 0 ? (
                    <Typography variant="body2">No logs available</Typography>
                  ) : (
                    game.gameLog.map((msg, idx) => (
                      <Box key={idx} mb={0.5}>
                        <Typography variant="body2" sx={{ color: msg.color || "black" }}>
                          {msg.time && `[${new Date(msg.time).toLocaleString()}] `}
                          {msg.senderName ? `${msg.senderName}: ` : ""}
                          {msg.contents}
                        </Typography>
                        {msg.storyResponse && (
                          <Typography variant="body2" sx={{ fontStyle: "italic", ml: 2, color: "#555" }}>
                            {msg.storyResponse}
                          </Typography>
                        )}
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HistoryPopup;
