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
  Chip,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";

function Profile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const [emailVerified, setEmailVerified] = useState(false);

  const [openReset, setOpenReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [originalUsername, setOriginalUsername] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [usernameError, setUsernameError] = useState("");
  
  const currentUserEmail = useSelector((state: RootState) => state.auth.user.email);

  useEffect(() => {
    console.log(currentUserEmail);
    fetch(`http://localhost:8080/api/users/email/${currentUserEmail}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setUsername(data.username);
        setOriginalUsername(data.username);
        setEmail(data.email);
        setBio(data.bio || "");
        setOriginalBio(data.bio || "");
        setPassword(data.password);
        setWins(data.wins || 0);
        setLosses(data.losses || 0);
        setGamesPlayed(data.gamesPlayed || 0);
        setEmailVerified(data.emailVerified || false);
      })
      .catch((err) => console.error(err));
  }, []);

  // detect if user made any changes
  const hasChanges =
    username.trim() !== originalUsername.trim() ||
    bio.trim() !== originalBio.trim();

  // Handle save
  const handleSaveChanges = async () => {
    if (!username.trim()) {
      setUsernameError("Username cannot be empty");
      return;
    }

    // Check for duplicate usernames
    const res = await fetch("http://localhost:8080/api/users");
    const users = await res.json();
    const duplicate = users.some(
      (u: any) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.email !== currentUserEmail
    );
    if (duplicate) {
      setUsernameError("That username is already taken");
      return;
    }

    setUsernameError("");
    setLoading(true);

    try {
      const updateRes = await fetch(
        `http://localhost:8080/api/users/updateProfile/${currentUserEmail}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, bio }),
        }
      );

      if (!updateRes.ok) throw new Error("Failed to update profile");

      setOriginalUsername(username);
      setOriginalBio(bio);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error saving profile changes.");
    } finally {
      setLoading(false);
    }
  };

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
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameError("");
            }}
            error={!!usernameError}
            helperText={usernameError}
            fullWidth
          />
          {/* Email with verification status */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              label="Email"
              value={email}
              type="email"
              disabled
              fullWidth
            />

            {emailVerified ? (
              <Chip
                label="Verified"
                color="success"
                icon={<CheckCircle />}
                sx={{ minWidth: 120 }}
              />
            ) : (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={async () => {
                  try {
                    console.log("Email: " + email);
                    const res = await fetch(
                      `http://localhost:8080/api/users/verify/${email}`,
                      { method: "PUT" }
                    );

                    if (!res.ok) throw new Error("Failed to send email");
                    alert("Verification email sent! Please check your inbox.");
                  } catch (err) {
                    console.error("Error sending verification email:", err);
                    alert("Error sending verification email.");
                  }
                }}
              >
                Verify Email
              </Button>
            )}
          </Box>

          <TextField
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                const res = await fetch(
                  `http://localhost:8080/api/users/forgotPassword/${email}`,
                  { method: "PUT" }
                );
                if (!res.ok) throw new Error("Failed to send email");
                alert("A password reset link has been sent to your email!");
              } catch (err) {
                console.error("Error sending reset email:", err);
                alert("Error sending password reset email.");
              }
            }}
          >
            Reset Password
          </Button>

          <Box>
            <Button
              variant="contained"
              disabled={!hasChanges || loading}
              color={hasChanges ? "primary" : "inherit"}
              onClick={handleSaveChanges}
            >
              {loading ? "Saving..." : "Save Changes"}
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
        </Stack>
      </Box>
    </div>
  );
}

export default Profile;
