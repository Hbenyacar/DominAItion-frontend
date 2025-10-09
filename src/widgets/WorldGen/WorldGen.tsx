import React, { useState } from 'react';

const WorldGenPanels = () => {
    const [selectedPanel, setSelectedPanel] = useState('');
    const [inputText, setInputText] = useState('');

    const handleSelectionChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSelectedPanel(event.target.value);
        setInputText(''); // Reset input when selection changes
    };

    const handleInputChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setInputText(event.target.value);
    };

    const handleSubmit = () => {
        alert(`Submitted text for ${selectedPanel}: ${inputText}`);
    };

    const panels = ['Predetermined World', 'Randomly Generated World', 'Custom World'];

    return (
        <div>
            <h2>Select World Generation Method</h2>
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
                                placeholder={`Enter description for ${panel}`}
                                value={inputText}
                                onChange={handleInputChange}
                            />
                            <button onClick={handleSubmit} style={{ marginLeft: '0.5rem' }}>
                                Submit
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default WorldGenPanels;
