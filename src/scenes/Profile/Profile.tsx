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
  Snackbar,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Checkbox, FormControlLabel } from "@mui/material";
import CustomTextField from "../../components/CustomTextField"; 


import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

function Profile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [wins, setWins] = useState(0);
  const [totalPlayTime, setTotalPlayTime] = useState(0.0);
  const [losses, setLosses] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const [emailVerified, setEmailVerified] = useState(false);

  const [openReset, setOpenReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [originalUsername, setOriginalUsername] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [originalNotificationsEnabled, setOriginalNotificationsEnabled] =
    useState<boolean>(true);
  const [usernameError, setUsernameError] = useState("");

  const [openConvert, setOpenConvert] = useState(false);
  const [newGuestUsername, setNewGuestUsername] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPassword, setNewGuestPassword] = useState("");

  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // default true

  const [guestFields, setGuestFields] = useState({
    username: { value: "", error: "" },
    email: { value: "", error: "" },
    password: { value: "", error: "" },
  });

  const handleGuestFieldChange = (field: string, value: string, error: string) => {
    setGuestFields(prev => ({ ...prev, [field]: { value, error } }));
  };

  const hasGuestErrors = Object.values(guestFields).some(f => f.error !== "" || f.value === "");

  const currentUserEmail = useSelector(
    (state: RootState) => state.auth.user?.email || null
  );

  useEffect(() => {
    console.log(currentUserEmail);
    fetch(`${API_BASE_URL}/api/users/email/${currentUserEmail}`)
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
        setTotalPlayTime(data.totalPlayTime || 0.0);
        setGamesPlayed(data.gamesPlayed || 0);
        setEmailVerified(data.emailVerified || false);
        setNotificationsEnabled(data.notificationsEnabled ?? true);
        setOriginalNotificationsEnabled(data.notificationsEnabled ?? true);
        setGamesPlayed(data.gamesPlayed);
      })
      .catch((err) => console.error(err));
  }, []);

  const isGuestAccount = email && email.endsWith("@guest.local");

  // detect if user made any changes
  const hasChanges =
    username.trim() !== originalUsername.trim() ||
    bio.trim() !== originalBio.trim() ||
    notificationsEnabled !== originalNotificationsEnabled;

  // Handle save
  const handleSaveChanges = async () => {
    if (!username.trim()) {
      setUsernameError("Username cannot be empty");
      return;
    }

    // Check for duplicate usernames
    const res = await fetch(`${API_BASE_URL}/api/users`);
    const users = await res.json();
    const duplicate = users.some(
      (u: any) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.email !== currentUserEmail &&
        u.notificationsEnabled !== notificationsEnabled
    );
    if (duplicate) {
      setUsernameError("That username is already taken");
      return;
    }

    setUsernameError("");
    setLoading(true);

    try {
      const updateRes = await fetch(
        `${API_BASE_URL}/api/users/updateProfile/${currentUserEmail}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, bio, notificationsEnabled }),
        }
      );

      if (!updateRes.ok) throw new Error("Failed to update profile");

      setOriginalUsername(username);
      setOriginalBio(bio);
      setOriginalNotificationsEnabled(notificationsEnabled);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Error saving profile changes.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/forgotPassword/${email}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Failed to send email");
      toast.info("A password reset link has been sent to your email!");
    } catch (err) {
      console.error("Error sending reset email:", err);
      toast.error("Error sending password reset email.");
    }
  };

  const handleConvertGuest = async () => {
    const newGuestUsername = guestFields.username.value
    const newGuestEmail = guestFields.email.value
    const newGuestPassword = guestFields.password.value

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/convertGuest/${currentUserEmail}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newGuestUsername,
            newGuestEmail,
            newGuestPassword,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to convert guest account");

      toast.success("Your account has been converted! You may now log out and log back in under your new credentials");

      // Update UI to reflect newly converted account
      setEmail(newGuestEmail);
      setUsername(newGuestUsername);
      setEmailVerified(false); // now they need to verify the real email

      setOpenConvert(false);
    } catch (err) {
      console.error(err);
      toast.error("Error converting guest account.");
    }
  };

  return (
    <Box>
      <Navbar />
      <Box sx={{ marginTop: "70px", padding: 4, maxWidth: 700, mx: "auto" }}>
        <Typography variant="h4" marginBottom="30px" fontWeight="bold">
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

          {/* Email Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              label="Email"
              value={email}
              type="email"
              disabled
              fullWidth
            />

            {/* Email Verification Chip/Button (also used to confirm guest accounts)*/}
            {isGuestAccount ? (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => setOpenConvert(true)}
              >
                Convert to Real Account
              </Button>
            ) : 
            emailVerified ? (
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
                      `${API_BASE_URL}/api/users/verify/${email}`,
                      { method: "PUT" }
                    );

                    if (!res.ok) throw new Error("Failed to send email");
                    toast.info(
                      "Verification email sent! Please check your inbox."
                    );
                  } catch (err) {
                    console.error("Error sending verification email:", err);
                    toast.error("Error sending verification email.");
                  }
                }}
              >
                Verify Email
              </Button>
            )}
          </Box>

          <Dialog open={openConvert} onClose={() => setOpenConvert(false)}>
            <DialogTitle>Convert Guest Account</DialogTitle>
            <DialogContent sx={{ backgroundColor: '#EEEEEE' }}>
              <Typography mb={2}>
                Your account is currently a guest account.  
                Enter a username, email and password to convert it into a permanent account.
              </Typography>

              <CustomTextField
                title="Username"
                placeholder="Choose a username"
                onValueChange={(val, err) => handleGuestFieldChange("username", val, err)}
                darkText={true}
              />

              <CustomTextField
                title="Email"
                type="email"
                placeholder="you@example.com"
                onValueChange={(val, err) => handleGuestFieldChange("email", val, err)}
                darkText={true}
              />

              <CustomTextField
                title="Password"
                type="password"
                placeholder="Enter a password"
                onValueChange={(val, err) => handleGuestFieldChange("password", val, err)}
                darkText={true}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenConvert(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConvertGuest}
                disabled={hasGuestErrors} // ✅ only enabled if all fields are valid
              >
                Convert
              </Button>
            </DialogActions>
          </Dialog>

          <TextField
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Notifications enabled?"
          />

          {/* Save Changes Button */}
          <Box>
            <Button
              variant="contained"
              disabled={!hasChanges || loading}
              onClick={handleSaveChanges}
              fullWidth
              sx={{
                backgroundColor: hasChanges ? "darkorange" : "gray",
                "&:hover": {
                  backgroundColor: hasChanges ? "#e67300" : "gray",
                },
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>

          <Divider />

          {/* Reset Password Button */}
          <Button
            variant="contained"
            onClick={handleResetPassword}
            fullWidth
            sx={{
              backgroundColor: "darkorange",
              "&:hover": {
                backgroundColor: "#e67300", // darker orange on hover
              },
            }}
          >
            Reset Password
          </Button>

          <Divider />

          {/* User Stats */}
          <Typography variant="h5">Game Stats</Typography>
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box>
              <Typography variant="h6">Wins</Typography>
              <Typography>{wins ?? 0}</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Losses</Typography>
              <Typography>{losses ?? 0}</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Games Played</Typography>
              <Typography>{gamesPlayed ?? 0}</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Time Played</Typography>
              <Typography>{(totalPlayTime ?? 0).toFixed(1)} hrs</Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
      />
    </Box>
  );
}

export default Profile;
