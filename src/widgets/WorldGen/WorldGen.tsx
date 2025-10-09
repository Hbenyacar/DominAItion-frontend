import React, { useState } from 'react';

const WorldGenPanels = () => {
    const [selectedPanel, setSelectedPanel] = useState('');
    const [inputText, setInputText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSelectionChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSelectedPanel(event.target.value);
        setInputText('');
        setSuccessMessage('');
        setError(null);
    };

    const handleInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setInputText(event.target.value);
    };

    const handleSubmit = async () => {
        if (!selectedPanel) return;

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage('');

        try {
            const response = await fetch('/api/ai/world', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mode: selectedPanel }),
            });

            if (!response.ok) {
                throw new Error('Failed to send mode to the server.');
            }

            setSuccessMessage(`Successfully submitted "${selectedPanel}" to /mode.`);
        } catch (err) {
            // @ts-ignore
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const panels = ['Panel 1', 'Panel 2', 'Panel 3'];

    return (
        <div>
            <h2>Select a World generation Type</h2>
            {panels.map((panel) => (
                <div key={panel} style={{ marginBottom: '1rem' }}>
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
                        <div style={{ marginTop: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder={`Enter text for ${panel}`}
                                value={inputText}
                                onChange={handleInputChange}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {error && <div style={{ color: 'red' }}>{error}</div>}
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
        </div>
    );
};

export default WorldGenPanels;
