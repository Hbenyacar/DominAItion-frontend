import React, { useEffect, useState, useRef } from "react";
import Navbar from "../navbar/NavBar";
import "./Home.css";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import InboxIcon from "@mui/icons-material/Inbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MapIcon from "@mui/icons-material/Map";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";
import CreateGame from "../../widgets/popups/CreateGame";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Slider from "@mui/material/Slider";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Radio from "@mui/material/Radio";

function valuetext(value: number) {
  return `${value} Points`;
}

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
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface Item {
  img: string;
  title: string;
  author: string;
}

function Home() {
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [selectedMode, setSelectedMode] = React.useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const navigate = useNavigate();
  const [alignment, setAlignment] = React.useState("");
  const [value1, setValue1] = useState(30);
  const [selectedImg, setSelectedImg] = React.useState<string | null>(null);

  const handleClick = (item: (typeof itemData)[0]) => {
    setSelectedImg(item.img);
  };

  const toGame = () => {
    navigate('/game');
  }

  const handleChange1 = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    setAlignment(newAlignment);
  };
  const toCreateGame = () => {
    navigate("/createGame");
  };

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

  return (
    <div>
      <Navbar />
      <div className="page">
        <div className="menu">
          <Box
            sx={{
              width: "100%",
              maxWidth: 360,
            }}
          >
            <List component="nav" aria-label="main mailbox folders">
              <ListItemButton
                sx={{
                  minWidth: "300px",
                  paddingLeft: "30px",
                  marginTop: "80px",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(230, 160, 120, 0.8)", // darker shade
                    color: "black", // text/icon color
                    "&:hover": {
                      backgroundColor: "rgba(220, 145, 105, 0.9)", // slightly darker on hover
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
                  minWidth: "300px",
                  paddingLeft: "30px",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(230, 160, 120, 0.8)", // darker shade
                    color: "black", // text/icon color
                    "&:hover": {
                      backgroundColor: "rgba(220, 145, 105, 0.9)", // slightly darker on hover
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
                  minWidth: "300px",
                  paddingLeft: "30px",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(230, 160, 120, 0.8)", // darker shade
                    color: "black", // text/icon color
                    "&:hover": {
                      backgroundColor: "rgba(220, 145, 105, 0.9)", // slightly darker on hover
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
              width: "100%",
              maxWidth: 360,
              mt: "375px", // same as marginTop: -32px (1 unit = 8px in MUI)
            }}
          >
            {" "}
            <Divider />
            <List component="nav" aria-label="main mailbox folders">
              <ListItemButton
                sx={{
                  minWidth: "300px",
                  paddingLeft: "30px",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(230, 160, 120, 0.8)", // darker shade
                    color: "black", // text/icon color
                    "&:hover": {
                      backgroundColor: "rgba(220, 145, 105, 0.9)", // slightly darker on hover
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
                  minWidth: "300px",
                  paddingLeft: "30px",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(230, 160, 120, 0.8)", // darker shade
                    color: "black", // text/icon color
                    "&:hover": {
                      backgroundColor: "rgba(220, 145, 105, 0.9)", // slightly darker on hover
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
        {selectedIndex === 1 && (
          <div className="games">
            <h1>Games</h1>
            <div>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                  sx={{
                    color: "black",
                    "& .MuiTabs-indicator": {
                      backgroundColor: "black",
                      height: 3,
                    },
                  }}
                >
                  <Tab
                    label="Create Game"
                    {...a11yProps(0)}
                    sx={{ "&.Mui-selected": { color: "rgb(207, 78, 10)" } }}
                  />
                  <Tab
                    label="Join Game"
                    {...a11yProps(1)}
                    sx={{ "&.Mui-selected": { color: "rgb(207, 78, 10)" } }}
                  />
                  <Tab
                    label="History"
                    {...a11yProps(2)}
                    sx={{ "&.Mui-selected": { color: "rgb(207, 78, 10)" } }}
                  />
                </Tabs>
              </Box>

              <CustomTabPanel value={value} index={0}>
                <div className="white-box">
                  <Button onClick={() => {toGame()}}
                    disabled={alignment == "" || selectedImg == null}
                    variant="contained"
                    color="primary"
                    sx={{
                      position: "absolute", // was "fixed"
                      bottom: 20,
                      right: 20,
                      borderRadius: "8px",
                      paddingX: 3,
                      paddingY: 1.5,
                    }}
                  >
                    Start Game
                  </Button>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      paddingTop: 2,
                    }}
                  >
                    {/* Game Mode inline */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <h2 style={{ margin: 0 }}>Game Mode</h2>
                      <ToggleButtonGroup
                        color="primary"
                        value={alignment}
                        exclusive
                        onChange={handleChange1}
                        aria-label="Platform"
                      >
                        <ToggleButton value="single">
                          Single Player
                        </ToggleButton>
                        <ToggleButton value="multi">Multi-player</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Points to Win inline */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <h2 style={{ margin: 0 }}>Points to Win</h2>
                      <Slider
                        aria-label="Points"
                        defaultValue={30}
                        getAriaValueText={valuetext}
                        valueLabelDisplay="auto"
                        step={10}
                        marks
                        onChange={(e, newValue) =>
                          setValue1(newValue as number)
                        }
                        min={10}
                        max={110}
                        sx={{ width: 200 }}
                      />
                      <p style={{ whiteSpace: "nowrap", margin: 0 }}>
                        {valuetext(value1)}
                      </p>
                    </Box>
                  </Box>

                  {/* Maps Section */}
                  <div>
                    <h2>Maps</h2>

                    <ImageList
                      sx={{ width: 1000, overflow: "visible" }} // ✅ remove height, let it expand
                      variant="quilted"
                      cols={4} // number of columns
                      rowHeight={180} // image height scale
                    >
                      {itemData.map((item) => (
                        <ImageListItem
                          key={item.img}
                          cols={item.cols || 2} // custom grid size if defined
                          rows={item.rows || 1}
                          sx={{
                            border:
                              selectedImg === item.img
                                ? "4px solid blue"
                                : "2px solid gray",
                            borderRadius: "8px",
                            cursor: "pointer",
                            position: "relative",
                          }}
                          onClick={() => setSelectedImg(item.img)}
                        >
                          <img
                            src={`${item.img}?w=${180 * (item.cols || 2)}&h=${180 * (item.rows || 1)}&fit=crop&auto=format`}
                            srcSet={`${item.img}?w=${180 * (item.cols || 2)}&h=${180 * (item.rows || 1)}&fit=crop&auto=format&dpr=2 2x`}
                            alt={item.title}
                            loading="lazy"
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                          <ImageListItemBar
                            title={item.title}
                            position="below"
                            sx={{ textAlign: "center", fontSize: "0.9rem" }}
                          />
                          <Box sx={{ position: "absolute", top: 4, right: 4 }}>
                            <Radio
                              checked={selectedImg === item.img}
                              color="primary"
                            />
                          </Box>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </div>
                </div>
              </CustomTabPanel>

              <CustomTabPanel value={value} index={1}>
                Join Game Coming Soon!
              </CustomTabPanel>

              <CustomTabPanel value={value} index={2}>
                History Coming Soon!
              </CustomTabPanel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const itemData = [
  {
    img: "Screenshot 2025-09-29 at 3.46.24 PM.png",
    title: "USA",
    cols: 1,
    rows: 1,
  },
];

export default Home;
