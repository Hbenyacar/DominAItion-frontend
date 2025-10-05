import React, { useState } from "react";

const PlayerActionInput = ({ maxLength = 250, placeholder = "Make Your Move..." }) => {
    const [text, setText] = useState('');

    const handleChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setText(value);
        }
    };

    return (
        <div style={
            {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                paddingLeft: '20px',
                paddingRight: '20px',

            }}>
            <textarea
                value={text}
                onChange={handleChange}
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
                color: text.length === maxLength ? 'red' : '#666' }}>
                {text.length} / {maxLength}
            </div>
        </div>
    );
};

export default PlayerActionInput;
