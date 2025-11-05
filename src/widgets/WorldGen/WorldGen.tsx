import React, { useState } from "react";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Paper,
} from "@mui/material";

const WorldGenPanels = () => {
  const [selectedPanel, setSelectedPanel] = useState("");
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverResponse, setServerResponse] = useState("");

  const handleSelectionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedPanel(event.target.value);
    setInputText("");
    setSuccessMessage("");
    setError(null);
    setServerResponse("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedPanel) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage("");
    setServerResponse("");

    try {
      const response = await fetch("/api/ai/world", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: selectedPanel }),
      });

      if (!response.ok) {
        throw new Error("Failed to send world description to the server.");
      }

      const data = await response.json();
      setServerResponse(data.message || JSON.stringify(data));
      setSuccessMessage(`Successfully submitted "${selectedPanel}" to /mode.`);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const panels = [
    "Generate a custom world",
    "Generate a world randomly",
    "Generate a predefined world",
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Select a World Generation Type
      </Typography>

      <RadioGroup value={selectedPanel} onChange={handleSelectionChange}>
        {panels.map((panel) => (
          <Paper
            key={panel}
            elevation={1}
            sx={{
              mb: 2,
              p: 1,
              border:
                selectedPanel === panel
                  ? "2px solid rgb(207,78,10)"
                  : "1px solid #ccc",
              borderRadius: 2,
              backgroundColor:
                selectedPanel === panel ? "rgba(207,78,10,0.05)" : "white",
              transition: "0.2s",
              "&:hover": { borderColor: "rgb(207,78,10)" },
            }}
          >
            <FormControlLabel
              value={panel}
              control={<Radio color="primary" />}
              label={
                <Typography variant="subtitle1" sx={{}}>
                  {panel}
                </Typography>
              }
            />

            {selectedPanel === panel && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder={`Enter text for ${panel}`}
                  value={inputText}
                  onChange={handleInputChange}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  sx={{
                    backgroundColor: "rgb(207,78,10)",
                    "&:hover": { backgroundColor: "darkorange" },
                    whiteSpace: "nowrap",
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </Box>
            )}

            {serverResponse && selectedPanel === panel && (
              <Box sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
                <Typography variant="body2">
                  <strong>Response:</strong> {serverResponse}
                </Typography>
              </Box>
            )}
          </Paper>
        ))}
      </RadioGroup>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMessage}
        </Alert>
      )}
    </Box>
  );
};

export default WorldGenPanels;
