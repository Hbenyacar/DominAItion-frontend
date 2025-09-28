
import React from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

interface CustomTextFieldProps {
    title: string,
    placeholder?: string
}

function CustomTextField({title, placeholder}: CustomTextFieldProps) {
    return(
        <Box
                component="form"
                sx={{
                width: '100%',          // make the Box fill the container
                display: 'flex',
                flexDirection: 'column', 
                gap: 2
                }}
                noValidate
                autoComplete="off"
            >
                <TextField
                    label={title}
                    placeholder={placeholder}
                    variant="outlined"
                    sx={{
                        width: '280px',
                        '& label': { color: 'white' },                              // default label
                        '& label.Mui-focused': { color: 'white' },                  // focused label
                        '& .MuiOutlinedInput-root fieldset': { borderColor: 'white' },           // default border
                        '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: 'white' }, // focused border
                        '& input': { color: 'white' },                              // input text
                    }}
                />

            </Box>
    );
}

export default CustomTextField;