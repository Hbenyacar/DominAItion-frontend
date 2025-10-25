import React, { useState } from "react";

const WorldGenPanels = () => {
  const [selectedPanel, setSelectedPanel] = useState("");
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverResponse, setServerResponse] = useState("");

  const handleSelectionChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSelectedPanel(event.target.value);
    setInputText("");
    setSuccessMessage("");
    setError(null);
  };

  const handleInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInputText(event.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedPanel) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage("");
    setServerResponse(""); // Clear previous response

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

      setServerResponse(data.message || JSON.stringify(data)); // Adjust this based on actual response
      setSuccessMessage(`Successfully submitted "${selectedPanel}" to /mode.`);
    } catch (err) {
      // @ts-ignore
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
    <div>
      <h3>Select a World generation Type</h3>
      {panels.map((panel) => (
        <div key={panel} style={{ marginBottom: "1rem" }}>
          <label>
            <input
              type="radio"
              name="panel"
              value={panel}
              checked={selectedPanel === panel}
              onChange={handleSelectionChange}
            />
            {panel}
          </label>

          {selectedPanel === panel && (
            <div style={{ marginTop: "0.5rem" }}>
              <input
                type="text"
                placeholder={`Enter text for ${panel}`}
                value={inputText}
                onChange={handleInputChange}
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ marginLeft: "0.5rem" }}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          )}
          {serverResponse && (
            <div style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap" }}>
              <strong>Response:</strong> {serverResponse}
            </div>
          )}
        </div>
      ))}

      {error && <div style={{ color: "red" }}>{error}</div>}
      {successMessage && <div style={{ color: "green" }}>{successMessage}</div>}
    </div>
  );
};

export default WorldGenPanels;
