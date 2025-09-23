import React from "react";
import "../index.css"; // ensure CSS is loaded
import "./Register.css"
import Box from '@mui/material/Box';
import CustomTextField from './Components/CustomTextField.tsx';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonIcon from '@mui/icons-material/Person';

import "../App.css";
import { emit } from "process";

function Register() {
  return (
    <div className="register">
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',  // stack form + links vertically
      alignItems: 'center',     // center horizontally
    }}
  >
    {/* Form container */}
    <div className="form-container">
      <div className="title">Register</div>
      <CustomTextField title={"Name"} placeholder={"John Doe"} />
      <CustomTextField title={"Email *"} placeholder={"JohnDoe@gmail.com"} />
      <CustomTextField title={"Password *"} placeholder={""} />

      <Button
        variant="outlined"
        startIcon={<PersonIcon />}
        sx={{
          color: 'white',
          borderColor: 'white',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderColor: 'black',
          },
          '& .MuiSvgIcon-root': { color: 'white' },
        }}
      >
        Register
      </Button>
    </div>

    {/* Links under the form */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginTop: '1rem', // space from form
        fontSize: '0.9rem',
      }}
    >
      <div
        style={{
          color: 'white',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontWeight: 500,
        }}
        onClick={() => console.log('Create an account clicked')}
      >
        Have an account?
      </div>

      <div
        style={{
          color: 'white',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontWeight: 500,
        }}
        onClick={() => console.log('Join as Guest clicked')}
      >
        Join as Guest
      </div>
    </div>
  </div>
</div>

  );
}

export default Register;
