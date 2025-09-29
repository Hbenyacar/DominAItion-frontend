import React from "react";
import './NavBar.css';
import Avatar from '@mui/material/Avatar';

function Navbar() {

  return (
    <div className="navbar">
      <div className="logo">
        <img src="Domination Logo.png"/>
      </div>
      <div className="nav-links">
        <Avatar alt="Cindy Baker" 
        onClick={() => {console.log('Avatar')}}
        sx={{cursor: 'pointer'}}
        src="avatar-icon-human-a-person-s-badge-social-media-profile-symbol-the-symbol-of-a-person-vector.jpg" />

      </div>
    </div>
  );
}

export default Navbar;
