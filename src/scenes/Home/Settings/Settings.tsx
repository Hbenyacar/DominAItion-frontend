import React, { useMemo, useRef, useState } from "react";
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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

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
    <div className="settings" style={{ flexGrow: 1 }}>
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
    </div>
  );
}
