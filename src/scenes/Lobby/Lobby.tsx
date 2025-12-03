import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import "./Lobby.css";
import { useLocation } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { SettingsInputSvideo } from "@mui/icons-material";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

interface User {
  id: string;
  username: string;
  icon?: string;
}

interface Lobby {
  id: string;
  code: string;
  map: string;
  users: User[];
  single: boolean;
}

function Lobby() {
  const params = useParams<{ lobbyId: string }>();
  const lobbyId = params.lobbyId;
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [joinedUsers, setJoinedUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [isSingle, setSingle] = useState(false);

  const stompClientRef = useRef<Client | null>(null); // ✅ shared reference

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userId = currentUser?.id;

  const location = useLocation();
  const passedWinningPoints = location.state?.winningPoints;

  // ✅ Function can now access stompClientRef.current
  const sendInvite = (friendId: string, friendName: string) => {
    const stompClient = stompClientRef.current;
    if (
      !stompClient ||
      !stompClient.connected ||
      !userId ||
      !currentUser?.username
    )
      return;

    const inviteMsg = {
      senderId: userId,
      senderName: currentUser.username,
      recipientId: friendId,
      lobbyId: lobbyId,
    };

    stompClient.publish({
      destination: "/app/invite/send",
      body: JSON.stringify(inviteMsg),
    });
  };

  const [winningPoints, setWinningPoints] = useState(passedWinningPoints);
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameCreated, setGameCreated] = useState(false);

  const navigate = useNavigate();

  const createGame = async () => {
    try {
      setLoading(true);
      console.log("Creating new game...");

      // 1️⃣ Create the game
      const response = await fetch(`${API_BASE_URL}/api/game/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // worldId: lobby?.map || "USA",
          worldId: "USA",
          winningPoints: String(winningPoints),
        }),
      });

      if (!response.ok)
        throw new Error(`Failed to create game: ${response.status}`);

      const newGameId = await response.text();
      setGameId(newGameId);
      console.log("✅ Game created with ID:", newGameId);

      // 2️⃣ Add *all* users in the lobby to the new game
      if (joinedUsers.length > 0) {
        console.log(`Adding ${joinedUsers.length} users to game...`);
        for (const user of joinedUsers) {
          const addPlayerResponse = await fetch(
            `${API_BASE_URL}/api/game/addPlayer`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                gameId: newGameId,
                playerId: user.id,
              }),
            }
          );

          if (addPlayerResponse.ok) {
            console.log(`🙋 Added player: ${user.username} (${user.id})`);
          } else {
            console.warn(`⚠️ Failed to add player ${user.username}`);
          }
        }
      } else {
        console.warn("⚠️ No users in lobby to add");
      }

      // 3️⃣ Start the game
      const startResponse = await fetch(`${API_BASE_URL}/api/game/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: newGameId }),
      });

      if (startResponse.ok) {
        console.log("🚀 Game started successfully!");
        setGameCreated(true);
        navigate(`/game/${newGameId}`); // redirect to game page
      } else {
        console.warn("⚠️ Failed to start game after creation");
      }
    } catch (error) {
      console.error("❌ Error creating game:", error);
      alert("Error creating game. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch user’s friends
  useEffect(() => {
    if (!userId) return;
    const fetchFriends = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/friends/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch friends");
        const data: User[] = await res.json();
        setFriends(data);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };
    fetchFriends();
  }, [userId]);

  //Auto-start single player
  useEffect(() => {
    // Auto-start a single-player game when exactly one user is in the lobby
    if (!gameCreated && isSingle && joinedUsers.length === 1) {
      createGame();
    }
  }, [gameCreated, isSingle, joinedUsers]);

  // ✅ Setup WebSocket
  useEffect(() => {
    if (!lobbyId || !userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      console.log("Connected to WebSocket");

      client.subscribe(`/topic/lobby/${lobbyId}`, (message) => {
        const updatedLobby: Lobby = JSON.parse(message.body);
        setLobby(updatedLobby);
        setSingle(updatedLobby.single);
        setJoinedUsers(updatedLobby.users || []);
      });

      client.publish({
        destination: "/app/lobby/join",
        body: JSON.stringify({ lobbyId, userId }),
      });
    };

    stompClientRef.current = client; // ✅ store for use later
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [lobbyId, userId]);

  // ✅ Modal toggle
  const handleInviteClick = () => setShowFriendsModal(true);
  const closeModal = () => setShowFriendsModal(false);

  return (
    <div className="lobby-container">
      <h3>Lobby Link: http://localhost:3000/lobby/{lobbyId}</h3>

      {lobby ? (
        <>
          <p>
            <strong>Map:</strong> {lobby.map}
          </p>
          <p>
            <strong>Code:</strong> {lobby.code}
          </p>
          <h2>Joined Users:</h2>
          <div className="user-list">
            {joinedUsers.map((user) => (
              <div key={user.id} className="user-item">
                {user.icon && (
                  <img
                    src={user.icon}
                    alt={user.username}
                    className="user-avatar"
                  />
                )}
                <p className="username">{user.username}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <Box
              className="invite-btn"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                opacity: 0.8,
                cursor: "not-allowed",
                backgroundColor: "rgba(207,78,10,0.8)",
                borderRadius: "6px",
                padding: "8px 16px",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#ba5700",
                  boxShadow: "none",
                },
              }}
            >
              <CircularProgress size={18} sx={{ color: "white" }} />
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Loading game...
              </Typography>
            </Box>
          ) : (
            <Box
              className="invite-btn"
              onClick={handleInviteClick}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgb(207,78,10)",
                borderRadius: "6px",
                padding: "8px 16px",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "none",
                "&:hover": {
                  backgroundColor: "rgb(207,78,10)", // 👈 stays the same color on hover
                },
              }}
            >
              Invite Friends
            </Box>
          )}
        </>
      ) : (
        <p>Loading lobby info...</p>
      )}

      {/* ✅ Friends Modal */}
      {showFriendsModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Your Friends</h2>
            {friends.length > 0 ? (
              <ul className="friend-list">
                {friends.map((friend) => (
                  <li key={friend.id} className="friend-item">
                    {friend.icon && (
                      <img
                        src={friend.icon}
                        alt={friend.username}
                        className="friend-avatar"
                      />
                    )}
                    <span>{friend.username}</span>
                    <button
                      className="send-invite-btn"
                      onClick={() => sendInvite(friend.id, friend.username)} // ✅ works now
                    >
                      Invite
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No friends found.</p>
            )}
            <button className="close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lobby;
