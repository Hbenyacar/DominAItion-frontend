import React, { useState, useEffect } from "react";
import Navbar from "../navbar/NavBar";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

function Profile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const [openReset, setOpenReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUserEmail = "jackrdar@gmail.com";

  useEffect(() => {
    fetch(`http://localhost:8080/api/users/email/${currentUserEmail}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setUsername(data.username);
        setEmail(data.email);
        setBio(data.bio || "");
        setPassword(data.password);
        setWins(data.wins || 0);
        setLosses(data.losses || 0);
        setGamesPlayed(data.gamesPlayed || 0);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleResetPassword = async () => {
    if (!newPassword) return alert("Please enter a new password");
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/users/updatePassword/${email}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPassword),
        }
      );
      if (!res.ok) throw new Error("Failed to update password");

      setPassword(newPassword);
      setOpenReset(false);
      setNewPassword("");
      alert("Password updated successfully!");
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <Box sx={{ marginTop: "100px", padding: 4, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>

        <Stack spacing={3}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            type="email"
            disabled
            fullWidth
          />
          <TextField
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              label="Password"
              value="********"
              type="password"
              disabled
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenReset(true)}
            >
              Reset Password
            </Button>
          </Box>

          <Divider />

          <Typography variant="h5">Game Stats</Typography>
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box>
              <Typography variant="h6">Wins</Typography>
              <Typography>{wins}</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Losses</Typography>
              <Typography>{losses}</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Games Played</Typography>
              <Typography>{gamesPlayed}</Typography>
            </Box>
          </Box>

          <Box>
            <Button variant="contained">Save Changes</Button>
          </Box>
        </Stack>
      </Box>

      {/* Reset Password Dialog */}
      <Dialog open={openReset} onClose={() => setOpenReset(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReset(false)}>Cancel</Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            disabled={loading}
          >
            {loading ? "Updating..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Profile;
