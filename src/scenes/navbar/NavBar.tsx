import React from "react";
import "./NavBar.css";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

function Navbar() {
  const avatarSrc = useSelector((state: RootState) => state.auth.avatarSrc);
  const navigate = useNavigate();
  const toHome = () => {
    navigate("/home");
  };
  const toProfile = () => {
    navigate("/profile");
  };
  return (
    <Box className="navbar">
      <div className="logo">
        <img
          src="Domination Logo.png"
          onClick={() => toHome()}
          style={{ cursor: "pointer" }}
        />
      </div>
      <div className="nav-links">
        <Avatar
          alt="Profile"
          onClick={toProfile}
          sx={{ cursor: "pointer" }}
          src={avatarSrc}
        />
      </div>
    </Box>
  );
}

export default Navbar;
