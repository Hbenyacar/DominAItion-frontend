import React, {useEffect, useState, useRef} from "react";
import Navbar from "../navbar/NavBar";
import "./Home.css";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MapIcon from '@mui/icons-material/Map';
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";
import CreateGame from "../../widgets/popups/CreateGame";

function Home() {
    const [selectedIndex, setSelectedIndex] = React.useState(1);
    const [selectedMode, setSelectedMode] = React.useState(0);
    const [popupOpen, setPopupOpen] = useState(false);
    const navigate = useNavigate();
    const toCreateGame = () => {
      navigate('/createGame');
    }

    const handleGameClick = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      index: number,
      ) => {
        setSelectedMode(index);
      };

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
  };

  
    return(
        <div>
            <Navbar/>
            <div className="page">
                <div className="menu"> 

                <Box 
                sx={{ 
                  width: '100%', 
                  maxWidth: 360,
                }}
>
                <List component="nav" aria-label="main mailbox folders">

                <ListItemButton
                    sx={{
                        minWidth: '300px',
                        paddingLeft: '30px',
                        marginTop:'80px',
                        '&.Mui-selected': {
                        backgroundColor: 'rgba(230, 160, 120, 0.8)', // darker shade
                        color: 'black', // text/icon color
                        '&:hover': {
                        backgroundColor: 'rgba(220, 145, 105, 0.9)', // slightly darker on hover
                      },
                    },
                    }}
                    selected={selectedIndex === 1}
                    onClick={(event) => handleListItemClick(event, 1)}
                    >
                    <ListItemIcon>
                    <VideogameAssetIcon />
                    </ListItemIcon>
                   <ListItemText primary="Games" />
                </ListItemButton>


                <ListItemButton
                    sx={{
                        minWidth: '300px',
                        paddingLeft: '30px',
                        '&.Mui-selected': {
                        backgroundColor: 'rgba(230, 160, 120, 0.8)', // darker shade
                        color: 'black', // text/icon color
                        '&:hover': {
                        backgroundColor: 'rgba(220, 145, 105, 0.9)', // slightly darker on hover
                      },
                    },
                    }}
                    selected={selectedIndex === 2}
                    onClick={(event) => handleListItemClick(event, 2)}
                    >
                    <ListItemIcon>
                    <PeopleIcon />
                    </ListItemIcon>
                   <ListItemText primary="Friends" />
                </ListItemButton>

                <ListItemButton
                    sx={{
                        minWidth: '300px',
                        paddingLeft: '30px',
                        '&.Mui-selected': {
                        backgroundColor: 'rgba(230, 160, 120, 0.8)', // darker shade
                        color: 'black', // text/icon color
                        '&:hover': {
                        backgroundColor: 'rgba(220, 145, 105, 0.9)', // slightly darker on hover
                      },
                    },
                    }}
                    selected={selectedIndex === 0}
                    onClick={(event) => handleListItemClick(event, 0)}
                    >
                    <ListItemIcon>
                    <MapIcon />
                    </ListItemIcon>
                   <ListItemText primary="Maps" />
                </ListItemButton>
              </List>
             </Box>

             <Box 
                sx={{ 
                  width: '100%', 
                  maxWidth: 360,
                  mt: '375px',  // same as marginTop: -32px (1 unit = 8px in MUI)
                }}
>               <Divider/>
                <List component="nav" aria-label="main mailbox folders">
                <ListItemButton
                    sx={{
                        minWidth: '300px',
                        paddingLeft: '30px',
                        '&.Mui-selected': {
                        backgroundColor: 'rgba(230, 160, 120, 0.8)', // darker shade
                        color: 'black', // text/icon color
                        '&:hover': {
                        backgroundColor: 'rgba(220, 145, 105, 0.9)', // slightly darker on hover
                      },
                    },
                    }}
                    selected={selectedIndex === 3}
                    onClick={(event) => handleListItemClick(event, 3)}
                    >
                    <ListItemIcon>
                    <SettingsIcon />
                    </ListItemIcon>
                   <ListItemText primary="Settings" />
                </ListItemButton>

                <ListItemButton
                    sx={{
                        minWidth: '300px',
                        paddingLeft: '30px',
                        '&.Mui-selected': {
                        backgroundColor: 'rgba(230, 160, 120, 0.8)', // darker shade
                        color: 'black', // text/icon color
                        '&:hover': {
                        backgroundColor: 'rgba(220, 145, 105, 0.9)', // slightly darker on hover
                      },
                    },
                    }}
                    selected={selectedIndex === 4}
                    >
                    <ListItemIcon>
                    <LogoutIcon />
                    </ListItemIcon>
                   <ListItemText primary="Log Out" />
                </ListItemButton>

              </List>
             </Box>
                </div>
                {selectedIndex == 1 && <div className="games">
                  <h1>Games</h1>
                      <div>
                      <Stack spacing={2} direction="row">
                        <Button onClick={() => setPopupOpen(true)} sx={{background:'black', 
                        '&:hover': {
                          background: 'white',
                          outline: 'black',
                          color: 'black',
                        },
                        transition: 'all 0.5s ease-in-out'
                      }}
                        variant="contained">Create Game</Button>
                        <Button sx={{background: 'black',
                        '&:hover': {
                          background: 'white',
                          outline: 'black',
                          color: 'black',
                        },
                        transition: 'all 0.5s ease-in-out'
                      }}

                        variant="contained">Join Game</Button>
                      </Stack>
                      <CreateGame open={popupOpen} onClose={() => {setPopupOpen(false)}}/>
                      </div>
                </div> }
            </div>
        </div>
    );
}

export default Home;