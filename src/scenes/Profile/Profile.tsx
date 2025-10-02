import React, { useState } from "react";
import Navbar from "../navbar/NavBar";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
} from "@mui/material";

function Profile() {
  // Mock user data
  const [username, setUsername] = useState("Player123");
  const [email, setEmail] = useState("player@email.com");
  const [bio, setBio] = useState("This is my bio");
  const [password, setPassword] = useState("********"); // uneditable

  // Mock stats
  const [wins] = useState(25);
  const [losses] = useState(10);
  const [gamesPlayed] = useState(wins + losses);

  return (
    <div>
      <Navbar />
      <Box sx={{ marginTop: "100px", padding: 4, maxWidth: 700, mx: "auto" }}>
        <h1>Profile</h1>

        {/* Editable Info */}
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
            onChange={(e) => setEmail(e.target.value)}
            type="email"
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
              value={password}
              type="password"
              disabled
              fullWidth
            />
            <Button variant="contained" color="primary">
              Reset Password
            </Button>
          </Box>

          <Divider />

          {/* Stats Section */}
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

          {/* Save button */}
          <Box>
            <Button variant="contained">Save Changes</Button>
          </Box>
        </Stack>
      </Box>
    </div>
  );
}

export default Profile;
