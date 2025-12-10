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
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';


import { emit } from "process";
import Navbar from "../navbar/NavBar";
import { Email } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setLogin } from "../../store/authSlice";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [invalidCredentials, setInvalidCredentials] = useState(false);

  const dispatch = useDispatch();

  const [fields, setFields] = useState({
    email: { value: "", error: "" },
    password: { value: "", error: "" },
  });

  const handleFieldChange = (field: string, value: string, error: string) => {
    setFields(prev => ({ ...prev, [field]: { value, error } }));
    
  };

  // Button is disabled if any field has an error or is empty
  const hasErrors = Object.values(fields).some(f => f.error !== "" || f.value === "");

  const toRegister = () => {
    navigate("/register");
  }

  const toRegisterAsGuest = () => {
    navigate("/register", { state: { guest: true } });
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    console.log(response);
  
    if (response.ok) {
      const data = await response.json(); // For now backend returns plain text
    console.log(data);
      console.log(data);
      console.log(data.id);
      dispatch(setLogin({ user: data, token: "" }));
      navigate("/home");
    } else {
      setInvalidCredentials(true);
    }
  };

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
          {invalidCredentials && (
    <small
      style={{ 
        color: '#b00020', 
        fontSize: '0.8rem', 
        marginTop: '4px', 
        display: 'block' 
      }}
      role="alert"
      aria-live="assertive"
    >
      Incorrect Username and/or Password
    </small>
  )}

          <CustomTextField
        title="Email"
        placeholder="JohnDoe@gmail.com"
        type="email"
        onValueChange={(val, err) => handleFieldChange("email", val, err)}
      />

      <CustomTextField
        title="Password"
        placeholder=""
        type="password"
        onValueChange={(val, err) => handleFieldChange("password", val, err)}
      />

      <Button
        variant="outlined"
        startIcon={<LockOpenIcon />}
        disabled={hasErrors}
        onClick={() => login(fields.email.value, fields.password.value)}
        sx={{
          color: hasErrors ? 'gray !important' : 'white',
          borderColor: hasErrors ? 'gray !important' : 'white',
          '&:hover': {
            backgroundColor: hasErrors ? 'transparent' : 'rgba(0,0,0,0.05)',
            borderColor: hasErrors ? 'gray !important' : 'black',
          },
          '&.Mui-disabled': {
            color: hasErrors ? 'gray !important' : 'white',
            borderColor: hasErrors ? 'gray !important' : 'white',
            '& .MuiSvgIcon-root': {
              color: hasErrors ? 'gray !important' : 'white',
            },
          },
        }}
      >
        Login
      </Button>
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
            onClick={toRegisterAsGuest}
          >
            Join as Guest
          </div>
        </div>
      </div>
    </div>
  );
}


export default Login;
