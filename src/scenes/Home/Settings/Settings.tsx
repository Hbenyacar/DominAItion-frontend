import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Typography,
  Badge,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import { Switch, FormControlLabel } from "@mui/material";
import "./Settings.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export default function Settings() {
  // 👤 Replace with your actual current user's email (can later fetch dynamically)
  const currentUserEmail = "jackrdar@gmail.com";

  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type: "success" | "error";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  const [musicEnabled, setMusicEnabled] = useState<boolean>(
    localStorage.getItem("musicEnabled") !== "false" // default true
  );

  interface TwoColumnBoxProps {
    title?: string;
    entries: { date: string; text: string }[];
  }

  // Handle background music
  useEffect(() => {
    const fetchMusicPreference = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/users/email/${currentUserEmail}`
        );
        if (!res.ok) throw new Error("Failed to fetch user");

        const user = await res.json();

        // If the backend returns user.musicEnabled, sync it locally
        if (user.musicEnabled !== undefined) {
          setMusicEnabled(user.musicEnabled);
          localStorage.setItem("musicEnabled", user.musicEnabled.toString());
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchMusicPreference();
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_IMAGE_MB = 5;

  const previewUrl = useMemo(() => {
    if (!screenshot) return "";
    return URL.createObjectURL(screenshot);
  }, [screenshot]);

  const resetForm = () => {
    setDescription("");
    setSteps("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setScreenshot(null);
  };

  const handleAttach = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        open: true,
        msg: "Please select an image file.",
        type: "error",
      });
      return;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_IMAGE_MB) {
      setToast({
        open: true,
        msg: `Image must be ≤ ${MAX_IMAGE_MB} MB.`,
        type: "error",
      });
      return;
    }
    setScreenshot(file);
  };

  const handleRemoveScreenshot = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setScreenshot(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const TwoColumnBox: React.FC<TwoColumnBoxProps> = ({
                                                       title = "Patch Notes",
                                                       entries,
                                                     }) => {
    return (
        <div className="two-col-wrapper">
          <h2 className="two-col-title">{title}</h2>

          <div className="two-col-box">
            <div className="col dates-col">
              {entries.map((e, i) => (
                  <div key={i} className="row">
                    {e.date}
                  </div>
              ))}
            </div>

            <div className="col text-col">
              {entries.map((e, i) => (
                  <div key={i} className="row">
                    {e.text}
                  </div>
              ))}
            </div>
          </div>
        </div>
    );
  };

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      setToast({
        open: true,
        msg: "Please provide a longer description (min 10 chars).",
        type: "error",
      });
      return;
    }
    if (steps.trim().length < 5) {
      setToast({
        open: true,
        msg: "Please include steps to reproduce (min 5 chars).",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("description", description.trim());
      form.append("steps", steps.trim());
      form.append("reporterEmail", currentUserEmail); // ✅ Include reporter’s email
      if (screenshot) form.append("screenshot", screenshot);

      const res = await fetch(`${API_BASE_URL}/api/bugs/report`, {
        method: "POST",
        body: form, // no headers! FormData auto-sets them
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit bug report");
      }

      setToast({
        open: true,
        msg: "Bug report submitted successfully!",
        type: "success",
      });
      resetForm();
      setOpen(false);
    } catch (err: any) {
      setToast({
        open: true,
        msg: err.message || "Something went wrong.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="settings" style={{ flexGrow: 1, marginLeft: 30 }}>
      {/* Header + Button (vertical layout) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // 🔥 stack vertically
          alignItems: "flex-start", // left-align content
          gap: 2, // spacing between elements
          mb: 3, // margin bottom before dialog
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>

        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: "rgb(207, 78, 10)",
            "&:hover": { backgroundColor: "darkorange" },
          }}
        >
          Report Bug
        </Button>
      </Box>
      {/* Report Bug Dialog */}
      <Dialog
        open={open}
        onClose={() => (!submitting ? setOpen(false) : null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Report a Bug
          <IconButton
            onClick={() => (!submitting ? setOpen(false) : null)}
            disabled={submitting}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="What happened?"
              placeholder="Describe the issue you encountered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={submitting}
            />

            <TextField
              label="How can we reproduce it?"
              placeholder="Step-by-step instructions…"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={submitting}
            />

            <Stack direction="row" alignItems="center" spacing={1}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
              <Tooltip title="Attach an optional screenshot">
                <span>
                  <Button
                    onClick={handleAttach}
                    startIcon={<UploadIcon />}
                    disabled={submitting}
                    variant="outlined"
                  >
                    Attach Screenshot
                  </Button>
                </span>
              </Tooltip>

              {screenshot && (
                <Badge color="primary" badgeContent="1">
                  <Typography variant="body2">{screenshot.name}</Typography>
                </Badge>
              )}

              {screenshot && (
                <Tooltip title="Remove screenshot">
                  <IconButton
                    onClick={handleRemoveScreenshot}
                    size="small"
                    disabled={submitting}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {previewUrl && (
              <Box
                component="img"
                src={previewUrl}
                alt="screenshot preview"
                sx={{
                  width: "100%",
                  maxHeight: 280,
                  objectFit: "contain",
                  borderRadius: 1,
                  border: "1px solid #eee",
                }}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => (!submitting ? setOpen(false) : null)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            sx={{
              backgroundColor: "rgb(207, 78, 10)",
              "&:hover": { backgroundColor: "darkorange" },
            }}
          >
            {submitting ? "Submitting…" : "Submit Report"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Background music */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Background Music
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={musicEnabled}
              onChange={async (e) => {
                const enabled = e.target.checked;
                setMusicEnabled(enabled);
                localStorage.setItem("musicEnabled", enabled.toString());

                try {
                  await fetch(
                    `${API_BASE_URL}/api/users/backgroundMusic/${currentUserEmail}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ musicEnabled: enabled }),
                    }
                  );

                  setToast({
                    open: true,
                    msg: enabled
                      ? "Background music enabled."
                      : "Background music disabled.",
                    type: "success",
                  });
                } catch (err) {
                  console.error(err);
                  setToast({
                    open: true,
                    msg: "Failed to update music preference.",
                    type: "error",
                  });
                }
              }}
              color="primary"
            />
          }
          label={musicEnabled ? "Enabled" : "Disabled"}
        />
      </Box>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
      <Box>
        <TwoColumnBox entries={[
            { date: "12-11-2025", text: "Added Game Spectating" },
            { date: "12-11-2025", text: "Added Character Upload Sound Effects" },
            { date: "12-11-2025", text: "Added Patch Notes Log" }
        ]} />
      </Box>

    </div>
  );
}
