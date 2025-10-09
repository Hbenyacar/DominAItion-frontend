import React, { useState } from "react";

const PlayerActionInput = ({ maxLength = 250, placeholder = "Make Your Move..." }) => {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setText(value);
        }
    };

    const handleSubmit = async () => {
        if (!text.trim()) return; // Prevent submitting empty or whitespace-only text

        setIsSubmitting(true);

        try {
            const response = await fetch("/story", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ request: text }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit");
            }

            const data = await response.text(); // since your endpoint returns a String
            console.log("Response from server:", data);

            // Reset text input after successful submission
            setText('');
        } catch (error) {
            console.error("Error submitting request:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline
            handleSubmit();
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            paddingLeft: '0px',
            paddingRight: '0px',
        }}>
            <textarea
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={4}
                style={{
                    padding: '10px',
                    fontSize: '1rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    resize: 'none',
                    width: '90%',
                    alignSelf: 'center'
                }}
            />
            <div style={{
                paddingRight: '80px',
                textAlign: 'right',
                marginTop: '5px',
                fontSize: '0.9rem',
                color: text.length === maxLength ? 'red' : '#666'
            }}>
                {text.length} / {maxLength}
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitting || text.trim() === ""}
                style={{
                    alignSelf: 'center',
                    marginTop: '10px',
                    padding: '10px 20px',
                    fontSize: '1rem',
                    borderRadius: '5px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    cursor: isSubmitting || text.trim() === "" ? 'not-allowed' : 'pointer'
                }}
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    );
};

export default PlayerActionInput;
