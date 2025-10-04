import React, { useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

interface CustomTextFieldProps {
    title: string;
    placeholder?: string;
    type?: "text" | "email" | "password";
    onValueChange?: (value: string, error: string) => void; // <--- add this
}


function CustomTextField({ title, placeholder, type = "text", onValueChange }: CustomTextFieldProps) {
    const [value, setValue] = useState("");
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        if (touched) validate(event.target.value); // live validation after first touch
    };

    const handleBlur = () => {
        setTouched(true);
        validate(value);
    };

    const validate = (val: string) => {
        let err = "";
        if (val.trim() === "") {
            err = `${title} is required`;
        } else if (type === "email" && !/^\S+@\S+\.\S+$/.test(val)) {
            err = "Please enter a valid email";
        } else if (type === "password" && (val.length < 8 || val.length > 32)) {
            err = "Password must be at least 6 characters";
        }
        setError(err);
        if (onValueChange) {
            onValueChange(val, err);
        }
    };

    return (
        <Box
            component="form"
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
            }}
            noValidate
            autoComplete="off"
        >
            <TextField
                label={title}
                placeholder={placeholder}
                variant="outlined"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!error}
                type={type === "password" ? "password" : "text"}
                helperText={error}
                sx={{
                    width: '280px',
                    '& label': { color: 'white' },
                    '& label.Mui-focused': { color: 'white' },
                    '& .MuiOutlinedInput-root fieldset': { borderColor: 'white' },
                    '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: 'white' },
                    '& input': { color: 'white' },
                    '& .MuiFormHelperText-root': { color: '#ff6b6b' },
                }}
            />
        </Box>
    );
}

export default CustomTextField;
