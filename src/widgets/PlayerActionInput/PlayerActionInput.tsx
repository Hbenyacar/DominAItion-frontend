import { Button, IconButton, CircularProgress } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

interface PlayerActionInputProps {
  maxLength?: number;
  placeholder?: string;
  onSubmitResponse?: (response: string) => void;
  gameId?: string;
  playerId?: string;
  userId?: string;
}

const PlayerActionInput: React.FC<PlayerActionInputProps> = ({
  maxLength = 250,
  placeholder = "Make Your Move...",
  onSubmitResponse,
  gameId,
  playerId,
  userId,
}) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  // Speech to text
  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setText((prev) => (prev + transcript).slice(0, maxLength));
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [maxLength]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  /* ---------------------- HANDLE TEXT INPUT ---------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setText(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ---------------------- SUBMIT USER PROMPT ---------------------- */
  const handleSubmit = async () => {
    if (!text.trim() || !gameId || !playerId) {
      console.warn("❌ Missing required fields:", { gameId, playerId });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          playerId,
          request: text.trim(),
          difficulty: 4,
        }),
      });

      if (!response.ok) throw new Error(`Failed to submit: ${response.status}`);

      const data = await response.text();
      if (onSubmitResponse) onSubmitResponse(data);

      setText("");
    } catch (error) {
      console.error("❌ Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
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
      display: "flex",
      alignItems: "center",
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
        isSubmitting || !text.trim() || userId !== playerId
          ? "rgba(207, 78, 10, 0.6)"
          : "rgb(207, 78, 10)",
      color: "white",
      border: "none",
      cursor:
        isSubmitting || !text.trim() || userId !== playerId
          ? "not-allowed"
          : "pointer",
      transition: "background-color 0.2s ease-in-out",
    },
    micButton: {
      marginLeft: "8px",
      color: isListening ? "red" : "white",
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
      {/* Mic Button */}
      <IconButton onClick={toggleListening} style={styles.micButton}>
        {isListening ? <MicIcon /> : <MicOffIcon />}
      </IconButton>

      {/* Input Row */}

      <div style={styles.inputWrapper}>
        {/* Text Input */}
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={4}
          style={styles.textarea}
        />

        {/* Send Button */}
        <Button
          onClick={() => {
            const audio = new Audio("/assets/sound_effects/submit_prompt.mp3");
            audio.play();
            handleSubmit();
          }}
          disabled={isSubmitting || text.trim() === "" || userId !== playerId}
          style={styles.button}
        >
          {isSubmitting ? (
            <CircularProgress size={18} thickness={4} sx={{ color: "white" }} />
          ) : (
            "Send"
          )}
        </Button>
      </div>

      {/* Counter Below */}
      <div style={styles.counter}>
        {text.length} / {maxLength}
      </div>
    </div>
  );
};

export default PlayerActionInput;
