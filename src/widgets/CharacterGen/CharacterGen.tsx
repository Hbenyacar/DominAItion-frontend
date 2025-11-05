import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";

const CharacterGen = () => {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
    setMessage("");
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setMessage("Description cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/ai/character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit description.");
      }

      setMessage("Description submitted successfully!");
      setDescription("");
    } catch (error: any) {
      setMessage(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Character Description
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <TextField
          multiline
          minRows={4}
          fullWidth
          placeholder="Enter your character description..."
          value={description}
          onChange={handleChange}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#ccc",
              },
              "&:hover fieldset": {
                borderColor: "rgb(207,78,10)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgb(207,78,10)",
              },
            },
          }}
        />

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
          sx={{
            alignSelf: "stretch",
            backgroundColor: "rgb(207,78,10)",
            "&:hover": { backgroundColor: "darkorange" },
            color: "white",
            px: 2,
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </Box>

      {message && (
        <Alert
          severity={
            message.toLowerCase().includes("success") ? "success" : "error"
          }
          sx={{ mt: 2 }}
        >
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default CharacterGen;
