import { Button, IconButton, CircularProgress, Slider, Collapse } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

interface PlayerActionInputProps {
  maxLength?: number;
  placeholder?: string;
  onSubmitResponse?: (response: string) => void;
  gameId?: string;
  playerId?: string;
  color?: string;
  userId?: string;
}

const PlayerActionInput: React.FC<PlayerActionInputProps> = ({
                                                               maxLength = 250,
                                                               placeholder = "Make Your Move...",
                                                               onSubmitResponse,
                                                               gameId,
                                                               playerId,
                                                               color,
                                                               userId,
                                                             }) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [internalMaxLength, setInternalMaxLength] = useState(maxLength);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const recognitionRef = useRef<any | null>(null);

  // Speech Recognition
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
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setText((prev) => (prev + transcript).slice(0, internalMaxLength));
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [internalMaxLength]);

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
    if (value.length <= internalMaxLength) {
      setText(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  //Submit Prompt
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
          color,
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
    settingsToggle: {
      cursor: "pointer",
      userSelect: "none" as const,
      color: "white",
      marginTop: "10px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "0.9rem",
    },
    sliderBox: {
      width: "85%",
      marginTop: "10px",
      padding: "10px",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: "8px",
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
      color: text.length === internalMaxLength ? "red" : "#666",
      paddingRight: "5%",
    },
  };

  return (
      <div className="player-input-container">

        <IconButton
            onClick={toggleListening}
            className={`player-input-mic ${isListening ? "listening" : ""}`}
        >
          {isListening ? <MicIcon /> : <MicOffIcon />}
        </IconButton>

        <div className="player-input-wrapper">
      <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={4}
          className="player-input-textarea"
      />

          <Button
              onClick={() => {
                const audio = new Audio("/assets/sound_effects/submit_prompt.mp3");
                audio.play();
                handleSubmit();
              }}
              disabled={isSubmitting || text.trim() === "" || userId !== playerId}
              className={`player-input-button ${
                  isSubmitting || text.trim() === "" || userId !== playerId
                      ? "disabled"
                      : ""
              }`}
          >
            {isSubmitting ? (
                <CircularProgress size={18} thickness={4} sx={{ color: "white" }} />
            ) : (
                "Send"
            )}
          </Button>
        </div>

        <div
            className={`player-input-counter ${
                text.length === internalMaxLength ? "maxed" : ""
            }`}
        >
          {text.length} / {internalMaxLength}
        </div>

        <div
            className="player-settings-toggle"
            onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <ExpandMoreIcon
              style={{
                transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "0.2s",
              }}
          />
          Message Settings
        </div>

        <Collapse in={settingsOpen} timeout={200}>
          <div className="player-slider-box">
            <div style={{ color: "white", marginBottom: "5px" }}>
              Max message length: {internalMaxLength}
            </div>

            <Slider
                value={internalMaxLength}
                onChange={(_, v) => setInternalMaxLength(v as number)}
                min={50}
                max={1000}
                step={10}
            />
          </div>
        </Collapse>
      </div>
  );
};

export default PlayerActionInput;
