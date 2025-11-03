import { useState } from "react";
import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirm) {
      return alert("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/resetPassword?token=${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );
      if (!res.ok) throw new Error("Reset failed");
      alert("Password updated successfully! You can now log in.");
    } catch (err) {
      alert("Error resetting password. Token may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 12, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Reset Password
      </Typography>
      <Stack spacing={2}>
        <TextField
          type="password"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          type="password"
          label="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Resetting..." : "Confirm Reset"}
        </Button>
      </Stack>
    </Box>
  );
}
