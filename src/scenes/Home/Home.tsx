import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Radio,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

// MUI icons
import {
  People as PeopleIcon,
  VideogameAsset as VideogameAssetIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Map as MapIcon,
  Mail,
  Search as SearchIcon,
} from "@mui/icons-material";

import FriendsPage from "./Friends/Friends";
import Messages from "./Messages/Messages";
import Settings from "./Settings/Settings";
import { useDispatch, useSelector } from "react-redux";
import { setMap } from "../../store/mapSlice";
import WorldGenPanels from "../../widgets/WorldGen/WorldGen";
import AdvancedGameSettings from "../../widgets/AdvancedGameSettings/AdvancedGameSettings";
// import CharacterGen from "../../widgets/CharacterGen/CharacterGen"; // ⬅ removed old character UI
import LobbyList from "../../components/LobbyList";
import AIPlayerSettings from "../../widgets/AIPlayerSettings/AIPlayerSettings";
import Achievements from "../Achievements/Achievements";
import { RootState } from "../../store/store";
import SpectateList from "../../components/SpectateList";
import CharactersPage from "./Characters/Characters";
import PopupButton from "../../components/PopupButton";
import SavedGamesList from "../../components/SavedGames";

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

interface Character {
  id: string;
  characterName: string;
  characterBio: string;
  intelligence: number;
  wisdom: number;
  charisma: number;
  strength: number;
  ingenuity: number;
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

async function getHistory(userId: string | undefined) {
  try {
    const response = await fetch("/api/users/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      console.error("Failed to fetch game info:", response.statusText);
      return null;
    }

    const data = await response.json();  // <-- read JSON once
    console.log("history:", data);       // <-- now you can log safely
    return data;
  } catch (error) {
    console.error("Error fetching game info:", error);
    return null;
  }
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

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
      dst,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
  );

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
  img: string;
  title: string;
  cols: number;
  rows: number;
  imgContents: HTMLImageElement;
}

interface GameHistoryItem {
  gameId: string;
  worldName: string;
  status: string;
  pointsToWin: number;
  leadingPlayer: string;
  summary: string;
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

  interface LobbyInner {
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
  const [maxInputLen, setMaxInputLen] = useState(10);
  const [isSingle, setIsSingle] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [historyUserId, setHistoryUserId] = useState<string | null>(null);
  const [searchPlayerId, setSearchPlayerId] = useState("");
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");

  const currUserID = useSelector(
    (state: RootState) => state.auth.user?.id || null
  );

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

    getHistory(currUserID);
  }, []);

  type Friend = {
    id: number;
    name: string;
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!currentUserEmail) return;

      try {
        const res = await fetch(
            `${API_BASE_URL}/api/users/email/${currentUserEmail}`
        );
        if (!res.ok) {
          console.error("Failed to fetch current user");
          return;
        }
        const userData = await res.json();
        setCurrentUserId(userData.id);
        setHistoryUserId(userData.id); // default history = current user
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, [currentUserEmail]);

  // 🔸 Fetch characters for the current user
  const fetchCharacters = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/characters/${currentUserId}`);
      if (!res.ok) {
        console.error("Failed to fetch characters");
        return;
      }

      const data: Character[] = await res.json();
      setCharacters(data);

      // keep placeholder selected unless user explicitly picks one
      if (!data.some((c) => c.id === selectedCharacterId)) {
        setSelectedCharacterId("");
      }
    } catch (err) {
      console.error("Error fetching characters:", err);
    }
  }, [currentUserId, selectedCharacterId]);

  // initial load when user is known
  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // refresh characters whenever user goes back to Games tab
  useEffect(() => {
    if (selectedIndex === 1) {
      fetchCharacters();
    }
  }, [selectedIndex, fetchCharacters]);

  //helper to add lobby creator to game (currently unused but kept)
  const addCreatorToGame = async (gameId: string) => {
    if (!currentUserId) {
      console.error("currentUserId is null; cannot add creator to game.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/game/addPlayer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: gameId,
          playerId: currentUserId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to add creator:", errorText);
      } else {
        console.log("Creator successfully added to game:", gameId);
      }
    } catch (err) {
      console.error("Error calling addPlayer:", err);
    }
  };

  const handleCreateLobby = async () => {
    const lobbyMap = mapName || "default";
    const newLobby = await createLobby(lobbyMap, isPrivate, isSingle); // or any map
    if (newLobby) {
      console.log("Lobby created:", newLobby);
      navigate(`/lobby/${newLobby.id}`, {
        state: {
          winningPoints,
          characterId: selectedCharacterId,
          maxInputLen,
        },
      });
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
      isPrivate: boolean,
      isSingle: boolean
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
          maxInputLen: maxInputLen,
          single: isSingle,
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
    if (newAlignment === "single") {
      setIsSingle(true);
    } else {
      setIsSingle(false);
    }
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
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await loadOpenCV();

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

  const fetchGameHistory = async (targetUserId: string) => {
    if (!currentUserId) return;

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const res = await fetch(
          `${API_BASE_URL}/api/users/fetchGames/${targetUserId}/${currentUserId}`
      );

      if (res.status === 403) {
        let msg = "You are blocked by this user.";
        try {
          const data = await res.json();
          if (data && typeof data.message === "string") {
            msg = data.message;
          }
        } catch {
          // ignore JSON parse errors
        }

        setGameHistory([]);
        setHistoryError(msg);
        return;
      }

      if (!res.ok) {
        setGameHistory([]);
        setHistoryError("Failed to load game history.");
        return;
      }

      const data = await res.json();

      if (data && data.success === false) {
        setGameHistory([]);
        setHistoryError(
            data.message || "Unable to view this user's history."
        );
        return;
      }

      if (!data || !Array.isArray(data.games)) {
        setGameHistory([]);
        setHistoryError("No game history found for this player.");
        return;
      }

      const mapped: GameHistoryItem[] = data.games.map((g: any) => ({
        gameId: g.gameId ?? g.id ?? "Unknown",
        worldName: g["World Name"] ?? g.worldName ?? "Unknown",
        status: g.status ?? "Unknown",
        pointsToWin: g.pointsToWin ?? g.winningPoints ?? 0,
        maxInputLen: g.maxInputLen ?? g.maxInputLength ?? 0,
        leadingPlayer: g.leadingPlayerName ?? g.leadingPlayer ?? "N/A",
        summary: g.summary ?? "",
      }));

      setGameHistory(mapped);
    } catch (err) {
      console.error("Error fetching game history:", err);
      setGameHistory([]);
      setHistoryError("Error fetching game history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (historyUserId && currentUserId) {
      fetchGameHistory(historyUserId);
    }
  }, [historyUserId, currentUserId]);

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
                        backgroundColor: "rgba(230, 160, 120, 0.8)",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(220, 145, 105, 0.9)",
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
                        backgroundColor: "rgba(230, 160, 120, 0.8)",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(220, 145, 105, 0.9)",
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
                    selected={selectedIndex === 5}
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
                        backgroundColor: "rgba(230, 160, 120, 0.8)",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(220, 145, 105, 0.9)",
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
                        backgroundColor: "rgba(230, 160, 120, 0.8)",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(220, 145, 105, 0.9)",
                        },
                      },
                    }}
                    selected={selectedIndex === 7}
                    onClick={(event) => handleListItemClick(event, 7)}
                >
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Characters" />
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
              <Divider />
              <List component="nav" aria-label="main mailbox folders">
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
                        backgroundColor: "rgba(230, 160, 120, 0.8)",
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(220, 145, 105, 0.9)",
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
                      <Tab label="Spectate" {...a11yProps(3)} sx={tabStyle} />
                      <Tab label="Saved Games" {...a11yProps(4)} sx={tabStyle} />
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
                          width: "100%",
                          mx: "auto",
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

                        {/* Character Selector */}
                        <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              minWidth: 260,
                            }}
                        >
                          <Typography variant="h6" sx={{ m: 0 }}>
                            Character
                          </Typography>
                          <FormControl size="small" sx={{ minWidth: 180 }}>
                            <Select
                                value={selectedCharacterId}
                                onChange={(e) =>
                                    setSelectedCharacterId(e.target.value as string)
                                }
                                displayEmpty
                            >
                              <MenuItem value="">
                                <em>Select a character</em>
                              </MenuItem>

                              {characters.map((c) => (
                                  <MenuItem key={c.id} value={c.id}>
                                    {c.characterName}
                                  </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>

                      {characters.length === 0 && (
                          <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                          >
                            You don’t have any characters yet. Create one from the
                            Characters tab.
                          </Typography>
                      )}

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
                            getAriaValueText={(val) => val.toString()}
                            valueLabelDisplay="auto"
                            step={5}
                            marks
                            min={5}
                            max={110}
                            sx={{
                              ml: "10px",
                              width: 250,
                              color: "rgb(207, 78, 10)",
                              "& .MuiSlider-thumb": {
                                height: 24,
                                width: 24,
                                backgroundColor: "white",
                                border: "3px solid rgb(207, 78, 10)",
                                "&:hover, &.Mui-focusVisible": {
                                  boxShadow:
                                      "0px 0px 0px 8px rgba(207,78,10,0.16)",
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

                                <Box
                                    component="img"
                                    src={`${item.imgContents.src}`}
                                    alt={item.title}
                                    loading="lazy"
                                    sx={{
                                      width: "90%",
                                      height: "150px",
                                      objectFit: "cover",
                                      borderRadius: 1,
                                    }}
                                />

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

                      {/* WorldGenPanels only (character creation moved to Characters page) */}
                      <Box
                          sx={{
                            display: "flex",
                            gap: 3,
                            alignItems: "flex-start",
                            mt: 3,
                            flexWrap: "wrap",
                          }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <WorldGenPanels />
                        </Box>
                      </Box>


                      {alignment === "single" && <AIPlayerSettings />}

                      {/* Start Game Button */}
                      <Button
                          onClick={() => {
                            if (!selectedCharacterId) {
                              alert(
                                  "Please select a character before starting a game."
                              );
                              return;
                            }

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
                          disabled={
                              alignment === "" ||
                              selectedImg == null ||
                              selectedCharacterId === ""
                          }
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
                    {/* Character Selector for Joining Games */}
                    <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 3,
                          alignItems: "center",
                          mb: 3,
                        }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 260 }}>
                        <Typography variant="h6" sx={{ m: 0 }}>
                          Character
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <Select
                              value={selectedCharacterId}
                              onChange={(e) => setSelectedCharacterId(e.target.value as string)}
                              displayEmpty
                          >
                            <MenuItem value="">
                              <em>Select a character</em>
                            </MenuItem>

                            {characters.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                  {c.characterName}
                                </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>

                    {characters.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          You don’t have any characters yet. Create one from the Characters tab.
                        </Typography>
                    )}

                   
                    <Box mt={2}>

                    </Box>

                    {/* Pass selectedCharacterId down so LobbyList can enforce / use it */}
                    <LobbyList selectedCharacterId={selectedCharacterId} />
                  </CustomTabPanel>

                  {/* Spectate Tab */}
                  <CustomTabPanel value={value} index={3}>
                    <Box mt={2}>
                      <Button
                          onClick={toSampleGame}
                          variant="contained"
                          color="primary"
                      >
                        Sample Game
                      </Button>
                    </Box>
                    <SpectateList />
                  </CustomTabPanel>


                  {/* Spectate Tab */}
                  <CustomTabPanel value={value} index={4}>
                    <SavedGamesList userId={currUserID}/>
                  </CustomTabPanel>

                  {/* History Tab */}
                  <CustomTabPanel value={value} index={2}>
                    <Box
                        sx={{
                          backgroundColor: "white",
                          borderRadius: 2,
                          p: 3,
                          mt: 2,
                          width: "100%",
                          mx: "auto",
                          boxShadow: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                    >
                      {/* Header: Title + Search */}
                      <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                          Game History
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (searchPlayerId.trim()) {
                                setHistoryUserId(searchPlayerId.trim());
                                fetchGameHistory(searchPlayerId.trim());
                              } else if (currentUserId) {
                                setHistoryUserId(currentUserId);
                                fetchGameHistory(currentUserId);
                              }
                            }}
                            sx={{ display: "flex", gap: 1 }}
                        >
                          <TextField
                              size="small"
                              variant="outlined"
                              label="Player ID"
                              value={searchPlayerId}
                              onChange={(e) => setSearchPlayerId(e.target.value)}
                              sx={{ minWidth: 220 }}
                          />
                          <Button
                              type="submit"
                              variant="contained"
                              startIcon={<SearchIcon />}
                              sx={{
                                backgroundColor: "rgb(207, 78, 10)",
                                "&:hover": { backgroundColor: "darkorange" },
                              }}
                          >
                            Search
                          </Button>
                        </Box>
                      </Box>

                      {/* Status / Error */}
                      {isLoadingHistory && (
                          <Typography color="text.secondary">
                            Loading history...
                          </Typography>
                      )}
                      {historyError && (
                          <Typography color="error" sx={{ mb: 1 }}>
                            {historyError}
                          </Typography>
                      )}

                      {/* History List */}
                      <Box
                          sx={{
                            mt: 1,
                            maxHeight: 400,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                      >
                        {gameHistory.length === 0 &&
                            !isLoadingHistory &&
                            !historyError && (
                                <Typography color="text.secondary">
                                  No games found for this player.
                                </Typography>
                            )}

                        {gameHistory.map((game) => (
                            <Box
                                key={game.gameId}
                                sx={{
                                  borderRadius: 2,
                                  border: "1px solid #ddd",
                                  p: 2,
                                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                                }}
                            >
                              <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    mb: 1,
                                    gap: 1,
                                  }}
                              >
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: "bold" }}
                                >
                                  Game ID: {game.gameId}
                                </Typography>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                  Status: {game.status}
                                </Typography>
                              </Box>

                              <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(160px, 1fr))",
                                    gap: 1,
                                    mb: 1,
                                  }}
                              >
                                <Typography variant="body2">
                                  <strong>World:</strong> {game.worldName}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Points to Win:</strong> {game.pointsToWin}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Leading Player:</strong>{" "}
                                  {game.leadingPlayer}
                                </Typography>
                              </Box>

                              {game.summary && (
                                  <Typography
                                      variant="body2"
                                      color="text.secondary"
                                  >
                                    <strong>Summary:</strong> {game.summary}
                                  </Typography>
                              )}
                              <PopupButton userId={currUserID}/>
                            </Box>
                        ))}
                      </Box>

                    </Box>
                  </CustomTabPanel>
                </Box>
            )}
            {selectedIndex === 2 && <FriendsPage />}
            {selectedIndex === 3 && <Settings />}
            {selectedIndex === 5 && <Messages />}
            {selectedIndex === 6 && <Achievements />}
            {selectedIndex === 7 && <CharactersPage />}
          </div>
        </div>
      </div>
  );
}

const tabStyle = {
  "&.Mui-selected": { color: "rgb(207, 78, 10)" },
};

export default Home;
