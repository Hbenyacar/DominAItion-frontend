import React from "react";
import './NavBar.css';

function Navbar() {
  return (
    <div className="navbar">
      <div className="logo">
        <img src="Domination Logo.png"/>
      </div>
      <div className="nav-links">
        <span>Home</span>
        <span>About</span>
        <span>Contact</span>
      </div>
    </div>
  );
}

export default Navbar;
