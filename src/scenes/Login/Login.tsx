import React from "react";
import '../../index.css';
import '../../App.css';

import "./Login.css"
import Box from '@mui/material/Box';
import CustomTextField from '../../components/CustomTextField';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useNavigate } from 'react-router-dom';


import { emit } from "process";
import Navbar from "../navbar/NavBar";

function Login() {

  const navigate = useNavigate();

  const toRegister = () => {
    navigate("/register");
  }

  return (

  <div className="login">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column', // stack form + links vertically
          alignItems: 'center',    // center horizontally
          paddingTop: '60px'
        }}
      >
        {/* Form container */}
        <div className="form-container">
          <div className="title">Login</div>

          <CustomTextField title={"Email *"} placeholder={"JohnDoe@gmail.com"} />
          <CustomTextField title={"Password *"} placeholder={""} />

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<LockOpenIcon />}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)', borderColor: 'black' },
                '& .MuiSvgIcon-root': { color: 'white' },
              }}
            >
              Login
            </Button>
          </Stack>
        </div>

        {/* Links below the form */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1rem', // spacing from form
            fontSize: '0.9rem',
          }}
        >
          <div
            style={{ color: 'white', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
            onClick={() => toRegister()}
          >
            Create an account
          </div>

          <div
            style={{ color: 'white', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
            onClick={() => console.log('Join as Guest clicked')}
          >
            Join as Guest
          </div>
        </div>
      </div>
    </div>
  );
}


export default Login;
