import React from "react";
import "./NavBar.css";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { setAvatar } from "../../state";
import { logout } from "../../store/authSlice";

const settings = ['Profile', 'Logout'];

function Navbar() {
  const avatarSrc = useSelector((state: RootState) => state.auth.avatarSrc);
  const user = useSelector((state: RootState) => state.auth.user);
  console.log("USER: " + user.id)
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const toHome = () => {
    navigate("/home");
  };
  const toProfile = () => {
    navigate("/profile");
  
  };

  const dispatch = useDispatch();

  const handleMenuSelect = (setting: string) => {
    if (setting === "Profile") {
      navigate("/profile");
    } else if (setting === "Settings") {
      console.log("Settings");
    } else if (setting === "Logout") {
      navigate("/login");
      dispatch(logout());
    } else {
      console.log("here");
    }
  }
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
      <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Account">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Avatar" src={avatarSrc} />
              </IconButton>
            </Tooltip>
            <Menu
              disableScrollLock={true}
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography sx={{ textAlign: 'center' }}
                  onClick={() => {handleMenuSelect(setting)}}
                  >{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
      </div>
    </Box>
  );
}

export default Navbar;
