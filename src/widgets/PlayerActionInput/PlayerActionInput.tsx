import { Button } from "@mui/material";
import React, { useState } from "react";

interface PlayerActionInputProps {
  maxLength?: number;
  placeholder?: string;
  onSubmitResponse?: (response: string) => void;
}

const PlayerActionInput: React.FC<PlayerActionInputProps> = ({
  maxLength = 250,
  placeholder = "Make Your Move...",
  onSubmitResponse,
}) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setText(value);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      const data = await response.text(); // backend returns a string

      if (onSubmitResponse) {
        onSubmitResponse(data); // Pass the response up
      }

      setText("");
    } catch (error) {
      console.error("Error submitting request:", error);
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
      padding: "10px 60px 10px 10px", // space for button
      fontSize: "1rem",
      borderRadius: "8px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      resize: "none" as const,
      fontFamily: "inherit",
      boxSizing: "border-box" as const,
      outline: "none",
      backgroundColor: "rgba(0, 0, 0, 0.3)", // 🟣 matches chat/story box
      color: "white", // white text for contrast
      backdropFilter: "blur(4px)", // optional: gives a subtle glassy look
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
          : "rgb(207, 78, 10)", // 🔸 your orange
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
          {isSubmitting ? "..." : "Send"}
        </Button>
      </div>
      <div style={styles.counter}>
        {text.length} / {maxLength}
      </div>
    </div>
  );
};

export default PlayerActionInput;
