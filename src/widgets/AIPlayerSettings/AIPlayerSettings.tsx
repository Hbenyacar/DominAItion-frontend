import React, { useState } from "react";

function AIPLayerSettings() {
    const [value, setValue] = useState(1); // 1 = Low, 2 = Medium, 3 = High
    const [playstyle, setPlaystyle] = useState("Defensive");

    const labels = ["Easy", "Medium", "Hard"];
    const playstyles = ["Aggressive", "Avoidant", "Defensive"];

    return (
        <div style={{ width: "400px", margin: "4px", textAlign: "left", justifyContent: "left"}}>
            <h3>AI Player Difficulty: {labels[value - 1]}</h3>
            <h4>AI Player Playstyle: {playstyle}</h4>
            <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                style={{ width: "100%" }}
            />
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    marginTop: "8px",
                }}
            >
                {labels.map((label) => (
                    <span key={label}>{label}</span>
                ))}
            </div>

            <div style={{marginTop: "20px" }}>
                <h4>Select Playstyle</h4>
                {playstyles.map((style) => (
                    <label key={style} style={{ marginRight: "10px" }}>
                        <input
                            type="radio"
                            name="playstyle"
                            value={style}
                            checked={playstyle === style}
                            onChange={(e) => setPlaystyle(e.target.value)}
                        />
                        {style}
                    </label>
                ))}
            </div>

        </div>
    );
}

export default AIPLayerSettings;
