import { Button } from "@mui/material";
import React, { useState } from "react";
import { CircularProgress } from "@mui/material";

interface PlayerActionInputProps {
  maxLength?: number;
  placeholder?: string;
  onSubmitResponse?: (response: string) => void;
  gameId?: string;
  playerId?: string;
}

const PlayerActionInput: React.FC<PlayerActionInputProps> = ({
  maxLength = 250,
  placeholder = "Make Your Move...",
  onSubmitResponse,
  gameId,
  playerId, // ✅ now destructured
}) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setText(value);
    }
  };

  /* ---------------------- SUBMIT USER PROMPT TO BACKEND ---------------------- */
  const handleSubmit = async () => {
    if (!text.trim() || !gameId || !playerId) {
      console.warn("❌ Missing required fields:", { gameId, playerId });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: gameId, // send current game ID
          playerId: playerId, // send current player ID
          request: text.trim(), // player’s action
          difficulty: 4, // replace with non hard codes
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit: ${response.status}`);
      }

      const data = await response.text(); // backend returns a string

      if (onSubmitResponse) {
        onSubmitResponse(data);
      }

      setText("");
    } catch (error) {
      console.error("❌ Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ---------------------- STYLES ---------------------- */
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      width: "100%",
      position: "relative" as const,
    },
    inputWrapper: {
      position: "relative" as const,
      width: "90%",
    },
    textarea: {
      width: "100%",
      padding: "10px 60px 10px 10px",
      fontSize: "1rem",
      borderRadius: "8px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      resize: "none" as const,
      fontFamily: "inherit",
      boxSizing: "border-box" as const,
      outline: "none",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      color: "white",
      backdropFilter: "blur(4px)",
    },
    button: {
      position: "absolute" as const,
      right: "10px",
      bottom: "10px",
      padding: "6px 14px",
      fontSize: "0.9rem",
      borderRadius: "6px",
      backgroundColor:
        isSubmitting || !text.trim()
          ? "rgba(207, 78, 10, 0.6)"
          : "rgb(207, 78, 10)",
      color: "white",
      border: "none",
      cursor: isSubmitting || !text.trim() ? "not-allowed" : "pointer",
      transition: "background-color 0.2s ease-in-out",
    },
    counter: {
      alignSelf: "flex-end",
      marginTop: "5px",
      fontSize: "0.85rem",
      color: text.length === maxLength ? "red" : "#666",
      paddingRight: "5%",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputWrapper}>
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={4}
          style={styles.textarea}
        />
        <Button
          onClick={() => {
            const audio = new Audio("/assets/sound_effects/submit_prompt.mp3");
            audio.play();
            handleSubmit();
          }}
          disabled={isSubmitting || text.trim() === ""}
          style={styles.button}
        >
          {isSubmitting ? (
            <CircularProgress size={18} thickness={4} sx={{ color: "white" }} />
          ) : (
            "Send"
          )}
        </Button>
      </div>
      <div style={styles.counter}>
        {text.length} / {maxLength}
      </div>
    </div>
  );
};

export default PlayerActionInput;
