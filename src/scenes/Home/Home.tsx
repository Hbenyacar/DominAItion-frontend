import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/NavBar";
import "./Home.css";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import BackgroundMusic from "../../components/BackgroundMusic";
import Trophy from "@mui/icons-material/EmojiEvents";
import { Typography } from "@mui/material";

// MUI components
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Radio,
} from "@mui/material";

// MUI icons
import {
  People as PeopleIcon,
  VideogameAsset as VideogameAssetIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Map as MapIcon,
  Mail,
} from "@mui/icons-material";

import FriendsPage from "./Friends/Friends";
import Messages from "./Messages/Messages";
import Settings from "./Settings/Settings";
import { useDispatch, useSelector } from "react-redux";
import { setMap } from "../../store/mapSlice";
import WorldGenPanels from "../../widgets/WorldGen/WorldGen";
import CharacterGen from "../../widgets/CharacterGen/CharacterGen";
import LobbyList from "../../components/LobbyList";
import AIPlayerSettings from "../../widgets/AIPlayerSettings/AIPlayerSettings";
import Achievements from "../Achievements/Achievements";
import { RootState } from "../../store/store";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export interface User {
  id: string;
  username: string;
  icon?: string;
}

export interface Lobby {
  id: string;
  code: string;
  map: string;
  users: User[];
}

function loadOpenCV(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).cv) {
      // Already loaded
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.x/opencv.js";
    script.async = true;
    script.onload = () => {
      // Wait for OpenCV to initialize
      (window as any).cv["onRuntimeInitialized"] = () => resolve();
    };
    script.onerror = () => reject(new Error("Failed to load OpenCV.js"));
    document.body.appendChild(script);
  });
}

declare const cv: any; // OpenCV global

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

function processImage(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  let src = cv.imread(canvas);
  let dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.Canny(src, dst, 50, 150);

  // dst now has edges in black/white
  // Next step: find contours
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    dst,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  // convert contours to SVG paths
  const paths = [];
  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    let d = "M";
    for (let j = 0; j < contour.rows; j++) {
      d += `${contour.intPtr(j, 0)[0]},${contour.intPtr(j, 0)[1]} `;
    }
    d += "Z";
    paths.push(d);
    contour.delete();
  }

  src.delete();
  dst.delete();
  contours.delete();
  hierarchy.delete();
}

interface ItemData {
  img: string; // filename or identifier
  title: string; // title
  cols: number;
  rows: number;
  imgContents: HTMLImageElement; // the loaded image instance
}

function Home() {
  const [itemData, setItemData] = useState<ItemData[]>([
    {
      img: "usa_map.png",
      title: "USA",
      cols: 1,
      rows: 1,
      imgContents: (() => {
        const img = new Image();
        img.src = process.env.PUBLIC_URL + "/images/usa_map.png";
        return img;
      })(),
    },
    {
      img: "medieval_europe_map.png",
      title: "Medieval Europe",
      cols: 1,
      rows: 1,
      imgContents: (() => {
        const img = new Image();
        img.src = process.env.PUBLIC_URL + "/images/medieval_europe_map.png";
        return img;
      })(),
    },
  ]);

  interface Lobby {
    id?: string;
    map: string;
    users?: string[];
  }

  const [preview, setPreview] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [selectedMode, setSelectedMode] = React.useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const navigate = useNavigate();
  const [alignment, setAlignment] = React.useState("");
  const [value1, setValue1] = useState(30);
  const [selectedImg, setSelectedImg] = React.useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [mapName, setMapName] = React.useState<string | null>(null);
  const [winningPoints, setWinningPoints] = useState(30);

  const currentUserEmail = useSelector(
    (state: RootState) => state.auth.user?.email || null
  );

  const dispatch = useDispatch();
  const handleMap = (title: string, image: string) => {
    setSelectedImg(image);
    setMapName(title);
    dispatch(setMap({ map: title }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPrivate(event.target.checked);
  };

  const [openFind, setOpenFind] = useState(false);

  const [openChat, setOpenChat] = useState(false);
  const [selectedChatFriend, setSelectedChatFriend] = useState<Friend | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Stop any global background music playing from the Game page
    const globalAudio = (window as any).globalGameAudio;
    if (globalAudio && !globalAudio.paused) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      (window as any).globalGameAudio = null;
    }

    // Also handle any leftover <audio> elements in DOM (fallback)
    const audios = document.getElementsByTagName("audio");
    for (const audio of audios) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  type Friend = {
    id: number;
    name: string;
  };

  const handleCreateLobby = async () => {
    const lobbyMap = mapName || "default";
    const newLobby = await createLobby(lobbyMap, isPrivate); // or any map
    if (newLobby) {
      console.log("Lobby created:", newLobby);
      navigate(`/lobby/${newLobby.id}`, { state: { winningPoints } });
    }
  };

  const getAllLobbies = async (): Promise<Lobby[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lobby`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch lobbies:", response.statusText);
        return [];
      }

      const lobbies: Lobby[] = await response.json();
      return lobbies;
    } catch (error) {
      console.error("Error fetching lobbies:", error);
      return [];
    }
  };

  const createLobby = async (
    map: string,
    isPrivate: boolean
  ): Promise<Lobby | null> => {
    try {
      console.log("isPrivat: " + isPrivate);
      const response = await fetch(`${API_BASE_URL}/api/lobby`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          map: map,
          privateLobby: isPrivate,
          winningPoints: winningPoints,
        }),
      });

      if (!response.ok) {
        console.error("Failed to create lobby", response.statusText);
        return null;
      }

      const lobby: Lobby = await response.json();
      return lobby;
    } catch (error) {
      console.error("Error creating lobby:", error);
      return null;
    }
  };

  const handleClick = (item: (typeof itemData)[0]) => {
    setSelectedImg(item.img);
  };
  const toGame = () => {
    navigate("/game");
  };
  const toSampleGame = () => {
    navigate("/sample");
  };
  const handleChange1 = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
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
    index: number
  ) => {
    setSelectedIndex(index);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // ✅ Now TypeScript knows `.click()` exists
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await loadOpenCV(); // dynamically load OpenCV if not loaded

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const paths = processImage(img);
    };

    setItemData((prev) => [
      ...prev,
      {
        img: file.name,
        title: file.name.split(".")[0],
        cols: 1,
        rows: 1,
        imgContents: img,
      },
    ]);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const incrementGamesPlayed = async (email: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/gamesPlayed/${email}`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) {
        console.error("Failed to increment gamesPlayed:", response.statusText);
      } else {
        const data = await response.json();
        console.log("✅ Games played updated:", data.gamesPlayed);
      }
    } catch (error) {
      console.error("Error incrementing gamesPlayed:", error);
    }
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
                    backgroundColor: "rgba(230, 160, 120, 0.8)",
                    color: "black",
                    "&:hover": {
                      backgroundColor: "rgba(220, 145, 105, 0.9)",
                    },
                  },
                }}
                selected={selectedIndex === 5} // give it its own index
                onClick={(event) => handleListItemClick(event, 5)}
              >
                <ListItemIcon>
                  <Mail />
                </ListItemIcon>
                <ListItemText primary="Messages" />
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
                selected={selectedIndex === 6}
                onClick={(event) => handleListItemClick(event, 6)}
              >
                <ListItemIcon>
                  <Trophy />
                </ListItemIcon>
                <ListItemText primary="Achievements" />
              </ListItemButton>
            </List>
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: 360,
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

        <div className="main" style={{ display: "flex" }}>
          {selectedIndex === 1 && (
            <Box className="games" sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Games
              </Typography>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="game tabs"
                  sx={{
                    color: "black",
                    "& .MuiTabs-indicator": {
                      backgroundColor: "black",
                      height: 3,
                    },
                  }}
                >
                  <Tab label="Create Game" {...a11yProps(0)} sx={tabStyle} />
                  <Tab label="Join Game" {...a11yProps(1)} sx={tabStyle} />
                  <Tab label="History" {...a11yProps(2)} sx={tabStyle} />
                </Tabs>
              </Box>

              {/* Create Game Tab */}
              <CustomTabPanel value={value} index={0}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: 2,
                    p: 3,
                    mt: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    // maxWidth: 1200, // wider box
                    width: "100%", // ensures it expands with screen
                    mx: "auto", // centers it horizontally
                    boxShadow: 2,
                  }}
                >
                  {/* Game Settings Row */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    {/* Game Mode */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="h6" sx={{ m: 0 }}>
                        Game Mode
                      </Typography>
                      <ToggleButtonGroup
                        color="primary"
                        value={alignment}
                        exclusive
                        onChange={handleChange1}
                        aria-label="game mode"
                      >
                        <ToggleButton value="single">
                          Single Player
                        </ToggleButton>
                        <ToggleButton value="multi">Multi-player</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Private Game Checkbox */}
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isPrivate}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label="Private"
                      />
                    </FormGroup>
                  </Box>

                  {/* Points to Win */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6" sx={{ m: 0 }}>
                      Points to Win
                    </Typography>
                    <Slider
                      aria-label="Points to Win"
                      value={winningPoints}
                      onChange={(e, newValue) =>
                        setWinningPoints(newValue as number)
                      }
                      getAriaValueText={(winningPoints) =>
                        winningPoints.toString()
                      }
                      valueLabelDisplay="auto"
                      step={5}
                      marks
                      min={5}
                      max={110}
                      sx={{
                        ml: "10px",
                        width: 250,
                        color: "rgb(207, 78, 10)", // main orange color
                        "& .MuiSlider-thumb": {
                          height: 24,
                          width: 24,
                          backgroundColor: "white",
                          border: "3px solid rgb(207, 78, 10)",
                          "&:hover, &.Mui-focusVisible": {
                            boxShadow: "0px 0px 0px 8px rgba(207,78,10,0.16)",
                          },
                        },
                        "& .MuiSlider-track": {
                          height: 8,
                          border: "none",
                          backgroundColor: "rgb(207, 78, 10)",
                        },
                        "& .MuiSlider-rail": {
                          height: 8,
                          opacity: 0.3,
                          backgroundColor: "#d0d0d0",
                          borderRadius: 4,
                        },
                        "& .MuiSlider-mark": {
                          backgroundColor: "#aaa",
                          height: 8,
                          width: 2,
                          "&.MuiSlider-markActive": {
                            opacity: 1,
                            backgroundColor: "rgb(207,78,10)",
                          },
                        },
                        "& .MuiSlider-valueLabel": {
                          backgroundColor: "rgb(207, 78, 10)",
                          color: "white",
                          borderRadius: "6px",
                          fontWeight: "bold",
                        },
                      }}
                    />

                    <Typography sx={{ whiteSpace: "nowrap" }}>
                      {winningPoints}
                    </Typography>
                  </Box>

                  {/* Maps Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Maps
                    </Typography>

                    {/* Maps Grid + Upload Tile */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 3,
                        flexWrap: "wrap",
                        maxWidth: 850,
                      }}
                    >
                      {itemData.map((item) => (
                        <Box
                          key={item.img}
                          onClick={() => handleMap(item.title, item.img)}
                          sx={{
                            width: 220,
                            height: 200,
                            border:
                              selectedImg === item.img
                                ? "4px solid blue"
                                : "2px solid gray",
                            borderRadius: 2,
                            cursor: "pointer",
                            overflow: "hidden",
                            transition: "0.2s",
                            "&:hover": { borderColor: "rgb(207, 78, 10)" },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          {/* Title above image */}
                          <Typography
                            variant="subtitle1"
                            sx={{
                              mt: 1,
                              mb: 1,
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {item.title}
                          </Typography>

                          {/* Map image stretched to fill box */}
                          <Box
                            component="img"
                            src={`${item.imgContents.src}`}
                            alt={item.title}
                            loading="lazy"
                            sx={{
                              width: "90%",
                              height: "150px",
                              objectFit: "cover", // stretches vertically while keeping ratio
                              borderRadius: 1,
                            }}
                          />

                          {/* Radio indicator in corner */}
                          <Box sx={{ position: "absolute", top: 4, right: 4 }}>
                            <Radio
                              checked={selectedImg === item.img}
                              color="primary"
                            />
                          </Box>
                        </Box>
                      ))}

                      {/* Upload Image Tile */}
                      <Box
                        sx={{
                          width: 220,
                          height: 200,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px dashed gray",
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "0.3s",
                          "&:hover": {
                            borderColor: "rgb(207, 78, 10)",
                            backgroundColor: "rgba(207, 78, 10, 0.05)",
                          },
                        }}
                        onClick={handleUploadButtonClick}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: "rgb(207, 78, 10)",
                            fontWeight: "bold",
                            textAlign: "center",
                            mb: 1,
                          }}
                        >
                          + Upload Image
                        </Typography>
                        <Box
                          sx={{
                            width: "90%",
                            height: "150px",
                            border: "2px dashed lightgray",
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontStyle: "italic",
                            color: "gray",
                          }}
                        >
                          Click to add
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* WorldGenPanels + CharacterGen Side by Side */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3, // spacing between boxes
                      alignItems: "flex-start",
                      mt: 3,
                      flexWrap: "wrap", // allows wrapping on smaller screens
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <WorldGenPanels />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <CharacterGen />
                    </Box>
                  </Box>

                  {alignment === "single" && <AIPlayerSettings />}

                  {/* Start Game Button */}
                  <Button
                    onClick={() => {
                      handleCreateLobby();

                      if (currentUserEmail) {
                        incrementGamesPlayed(currentUserEmail);
                      }
                      const audio = new Audio(
                        "/assets/sound_effects/game_start.mp3"
                      );
                      audio.play();
                      toGame();
                    }}
                    disabled={alignment === "" || selectedImg == null}
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      backgroundColor: "rgb(207, 78, 10)",
                      "&:hover": { backgroundColor: "darkorange" },
                      color: "white",
                      mt: 4,
                      alignSelf: "flex-start",
                    }}
                  >
                    Start Game
                  </Button>
                </Box>

                <Box
                  component="input"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  sx={{ display: "none" }}
                />
              </CustomTabPanel>

              {/* Join Game Tab */}
              <CustomTabPanel value={value} index={1}>
                <Typography>Join Game Coming Soon!</Typography>
                <Box mt={2}>
                  <Button
                    onClick={toSampleGame}
                    variant="contained"
                    color="primary"
                  >
                    Sample Game
                  </Button>
                </Box>
                <LobbyList />
              </CustomTabPanel>

              {/* History Tab */}
              <CustomTabPanel value={value} index={2}>
                <Typography>History Coming Soon!</Typography>
              </CustomTabPanel>
            </Box>
          )}
          {selectedIndex === 2 && <FriendsPage />}
          {selectedIndex === 3 && <Settings />}
          {selectedIndex === 5 && <Messages />}
          {selectedIndex === 6 && <Achievements />}
        </div>
      </div>
    </div>
  );
}

const tabStyle = {
  "&.Mui-selected": { color: "rgb(207, 78, 10)" },
};

export default Home;
