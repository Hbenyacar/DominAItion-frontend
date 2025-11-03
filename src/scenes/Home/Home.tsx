import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/NavBar";
import "./Home.css";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

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
      img: "homepageUSmap.png",
      title: "USA",
      cols: 1,
      rows: 1,
      imgContents: (() => {
        const img = new Image();
        img.src = process.env.PUBLIC_URL + "/homepageUSmap.png";
        return img;
      })(),
    },
    {
      img: "europe.jpeg",
      title: "Medieval Europe",
      cols: 1,
      rows: 1,
      imgContents: (() => {
        const img = new Image();
        img.src = process.env.PUBLIC_URL + "/europe.jpeg";
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

  type Friend = {
    id: number;
    name: string;
  };

  const handleCreateLobby = async () => {
    const lobbyMap = mapName || "default"; 
    const newLobby = await createLobby(lobbyMap, isPrivate); // or any map
    if (newLobby) {
      console.log("Lobby created:", newLobby);
      navigate(`/lobby/${newLobby.id}`);
    }
  };

  const getAllLobbies = async (): Promise<Lobby[]> => {
    try {
      const response = await fetch("http://localhost:8080/api/lobby", {
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
      console.log("isPrivat: " + isPrivate)
      const response = await fetch("http://localhost:8080/api/lobby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ map: map, privateLobby: isPrivate }), // ✅ pass both
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
        <div className="main" style={{ display: "flex" }}>
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
                    <Box
                      sx={{
                        display: "flex",
                        bottom: 20,
                        left: 20,
                        alignItems: "center",
                        gap: 6,
                        paddingTop: 2,
                      }}
                    >
                      {/* Game Mode inline */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
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
                          <ToggleButton value="multi">
                            Multi-player
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                      
                      {/* Points to Win inline */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
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
                    <FormGroup>
                    <FormControlLabel control={<Checkbox checked={isPrivate}
                      onChange={handleCheckboxChange}/>} label="Private" />
                    </FormGroup>
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
                            onClick={() => handleMap(item.title, item.img)}
                          >
                            <img
                              //Resizing has been temporarily removed to allow for custom image uploads to appear in the thumbnail
                              src={`${item.imgContents.src}`}
                              //srcSet={`${item.imgContents.src}?w=${180 * (item.cols || 2)}&h=${180 * (item.rows || 1)}&fit=crop&auto=format&dpr=2 2x`}
                              srcSet={`${item.imgContents.src}`}
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
                            <Box
                              sx={{ position: "absolute", top: 4, right: 4 }}
                            >
                              <Radio
                                checked={selectedImg === item.img}
                                color="primary"
                              />
                            </Box>
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </div>
                    <Button
                      onClick={handleUploadButtonClick}
                      sx={{
                        marginTop: "20px",
                        color: "white",
                        backgroundColor: "rgb(207, 78, 10)",
                      }}
                    >
                      Upload Image
                    </Button>
                    <Box mt={3}>
                      <WorldGenPanels />
                    </Box>

                    <Box>
                      <CharacterGen />
                    </Box>
                    <Button
                      onClick={() => {
                        handleCreateLobby();
                      }}
                      disabled={alignment == "" || selectedImg == null}
                      variant="contained"
                      color="primary"
                      sx={{
                        borderRadius: "8px",
                        paddingX: 3,
                        paddingY: 1.5,
                        backgroundColor: "rgb(207, 78, 10)", // your color
                        "&:hover": { backgroundColor: "darkorange" },
                        color: "white",
                        marginTop: 4,
                      }}
                    >
                      Start Game
                    </Button>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                  <div>Join Game Coming Soon!</div>
                  <br />
                  <div>
                    <Button
                      onClick={() => {
                        toSampleGame();
                      }}
                      variant="contained"
                      color="primary"
                    >
                      Sample Game
                    </Button>
                  </div>
                  <LobbyList/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                  History Coming Soon!
                </CustomTabPanel>
              </div>
            </div>
          )}
          {selectedIndex === 2 && <FriendsPage />}
          {selectedIndex === 3 && <Settings />}
          {selectedIndex === 5 && <Messages />}
        </div>
      </div>
    </div>
  );
}

export default Home;
