import React, {useEffect, useState, useRef} from "react";
import '../../index.css';
import '../../App.css';

import "./Register.css"
import Box from '@mui/material/Box';
import CustomTextField from '../../components/CustomTextField';
import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';



import { emit } from "process";

function Register() {

  const navigate = useNavigate();

  const toLogin = () => {
    navigate("/login");
  }

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
        onClick={() => toLogin()}
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
