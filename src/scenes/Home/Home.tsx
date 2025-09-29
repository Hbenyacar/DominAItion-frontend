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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function Home() {
    const [selectedIndex, setSelectedIndex] = React.useState(1);
    const [selectedMode, setSelectedMode] = React.useState(0);
    const [popupOpen, setPopupOpen] = useState(false);
    const navigate = useNavigate();
    const [alignment, setAlignment] = React.useState('web');

  const handleChange1 = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    setAlignment(newAlignment);
  };
    const toCreateGame = () => {
      navigate('/createGame');
    }

    const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example"
                            sx={{
                              color: 'black',
                              "& .MuiTabs-indicator": {
                                backgroundColor: "black",  // sets the underline color
                                height: 3                  // optional: thicker underline
                              }
                            }}>
                            <Tab label="Create Game" {...a11yProps(0)} sx={{ 
                            "&.Mui-selected": { color: 'rgb(207, 78, 10)' } // text black when selected
                            }}/>
                            <Tab label="Join Game" {...a11yProps(1)} sx={{ 
                            "&.Mui-selected": { color: "rgb(207, 78, 10)" } // text black when selected
                            }}/>
                            <Tab label="History" {...a11yProps(2)} sx={{ 
                            "&.Mui-selected": { color: 'rgb(207, 78, 10)' } // text black when selected
                            }}/>
                          </Tabs>
                        </Box>
                        <CustomTabPanel value={value} index={0} >
                          <div>
                          <h2>Game Mode</h2>
                          <ToggleButtonGroup
                            color="primary"
                            value={alignment}
                            exclusive
                            onChange={handleChange1}
                            aria-label="Platform"
                          >
                            <ToggleButton value="web">Single Player</ToggleButton>
                            <ToggleButton value="android">Multi-player</ToggleButton>
                          </ToggleButtonGroup>
                          </div>
                          <div style={{marginTop: '50px'}} className="points-req">
                            <h2>Points Required</h2>
                          </div> 


                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                          Join Game Coming Soon!
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={2}>
                          History Coming Soon!
                        </CustomTabPanel>
                      </div>
                </div> }
            </div>
        </div>
    );
}

export default Home;