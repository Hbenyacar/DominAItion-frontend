import React, { useState } from "react";
import "./AdvancedGameSettings.css";

export interface AdvancedGameSettingsProps {
    title?: string;
    initialValue?: number;
    min?: number;
    max?: number;
    onChange?: (value: number) => void;
    startCollapsed?: boolean;
}

const AdvancedGameSettings: React.FC<AdvancedGameSettingsProps> = ({
                                                                       title = "Menu",
                                                                       initialValue = 100,
                                                                       min = 20,
                                                                       max = 200,
                                                                       onChange,
                                                                       startCollapsed = false,
                                                                   }) => {
    const [collapsed, setCollapsed] = useState(startCollapsed);
    const [value, setValue] = useState(
        Math.min(Math.max(initialValue, min), max)
    );

    const toggle = () => setCollapsed(!collapsed);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setValue(val);
        onChange?.(val);
    };

    return (
        <div className="ags-container">
            {/* Header */}
            <div
                className="ags-header"
                tabIndex={0}
                role="button"
                aria-expanded={!collapsed}
                onClick={toggle}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle();
                    }
                }}
            >
                <span className="ags-title">{title}</span>
                <button className="ags-toggle-btn" aria-label="Toggle menu">
                    {collapsed ? "▸" : "▾"}
                </button>
            </div>

            {/* Content */}
            <div className={`ags-content ${collapsed ? "collapsed" : ""}`}>
                <div className="ags-row">
                    <label className="ags-label">Range</label>

                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        onChange={handleSliderChange}
                        className="ags-slider"
                    />

                    <div className="ags-value">{value}</div>
                </div>

                <div className="ags-description">
                    Adjust between {min} and {max}.
                </div>
            </div>
        </div>
    );
};

export default AdvancedGameSettings;
