import React, {useEffect, useState, useRef} from "react";
import '../../index.css';
import '../../App.css';

import "./Register.css"
import Box from '@mui/material/Box';
import CustomTextField from '../../components/CustomTextField';
import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { setLogin } from "../../store/authSlice";



import { emit } from "process";
import { useDispatch } from "react-redux";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

function Register() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const isGuest = location.state?.guest === true;

  const [exists, setExists] = useState(true);

  const [fields, setFields] = useState({
    username: { value: "", error: "" },
    email: { value: "", error: "" },
    password: { value: "", error: "" },
  });

  const handleFieldChange = (field: string, value: string, error: string) => {
    setFields(prev => ({ ...prev, [field]: { value, error } }));
  };

  // Button is disabled if any field has an error or is empty
  const hasErrors = Object.values(fields).some(f => f.error !== "" || f.value === "");

  const register = async (email: string, password: string, username: string) => {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, username })
    });
    console.log(response);
    if (!response.ok) {
      console.log("FALSE");
      setExists(false);
      return;
    }
    console.log("TRUE");
    const data = await response.json(); // For now backend returns plain text
    console.log(data);

    if (data != null) {
      dispatch(setLogin({ user: data, token: "" }));
      console.log(data.id);
      navigate('/avatar');
    }
  };

  const generateGuestAccount = () => {
    const random = Math.random().toString(36).substring(2,11)
    return {
      email: `guest_${random}@guest.local`,
      password: `guest_${random}`,
      username: `Guest_${random}`
    }
  }

  const registerAsGuest = async () => {
    const { email, password, username } = generateGuestAccount();
    console.log(email)
    await register(email, password, username);
  };


  const toLogin = () => {
    navigate("/login");
  }

  useEffect(() => {
    if (isGuest) {
      registerAsGuest();
    }
  }, [isGuest]);

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
      {!exists && (
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
      Email Already Exists
    </small>
  )}
      <CustomTextField
        title="Username"
        placeholder="John Doe"
        type="text"
        onValueChange={(val, err) => handleFieldChange("username", val, err)}
      />

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
        startIcon={<PersonIcon />}
        disabled={hasErrors}
        onClick={() => register(fields.email.value, fields.password.value, fields.username.value)}
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
        onClick={() => registerAsGuest()}
      >
        Join as Guest
      </div>
    </div>
  </div>
</div>

  );
}

export default Register;
