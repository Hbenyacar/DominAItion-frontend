import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { CircularProgress, Box, Typography } from "@mui/material";
import "./Lobby.css";

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

  // MUST exist — backend should include it
  ownerId: string;
}

function Lobby() {
  const { lobbyId } = useParams<{ lobbyId: string }>();

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [joinedUsers, setJoinedUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const stompClientRef = useRef<Client | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userId = currentUser?.id;

  const location = useLocation();
  const passedWinningPoints = location.state?.winningPoints;
  const passedCharacterId = location.state?.characterId as string | undefined;

  const [winningPoints, setWinningPoints] = useState(passedWinningPoints);

  const navigate = useNavigate();

  // 🟠 SEND FRIEND INVITE
  const sendInvite = (friendId: string, friendName: string) => {
    const stompClient = stompClientRef.current;
    if (!stompClient || !stompClient.connected || !userId) return;

    stompClient.publish({
      destination: "/app/invite/send",
      body: JSON.stringify({
        senderId: userId,
        senderName: currentUser.username,
        recipientId: friendId,
        lobbyId,
      }),
    });
  };

  // 🟢 THE **ONLY** GAME CREATOR (LOBBY OWNER)
  const createGame = async () => {
    if (!stompClientRef.current) return;
  
    try {
      setLoading(true);
  
      const response = await fetch(`${API_BASE_URL}/api/game/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worldId: "USA",
          winningPoints: String(winningPoints ?? 100), // default to 100
          lobbyId,
        }),
      });
  
      // If response is not OK, get the text/body to see the error
      if (!response.ok) {
        const text = await response.text().catch(() => "(no body)");
        throw new Error(`Failed to create game: ${response.status} - ${text}`);
      }
  
      const newGameId = await response.text();
      setGameId(newGameId);
  
      // Broadcast game creation to everyone
      stompClientRef.current.publish({
        destination: `/app/lobby/${lobbyId}/gameCreated`,
        body: JSON.stringify({ gameId: newGameId }),
      });
  
    } catch (error: any) {
      console.error("Error creating game:", error.message);
      console.error("Full error object:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // 🔵 Fetch friend list
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

  // 🟣 WebSocket Setup
useEffect(() => {
  if (!lobbyId || !userId) return;

  const client = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
    reconnectDelay: 5000,
    debug: console.log,
  });

  client.onConnect = () => {
    console.log("Connected to WebSocket");

    client.subscribe(`/topic/lobby/${lobbyId}`, (msg) => {
      const updatedLobby: Lobby = JSON.parse(msg.body);
      setLobby(updatedLobby);
      setJoinedUsers(updatedLobby.users);

      const userCount = updatedLobby.users.length;
      const isCreator = updatedLobby.users[0]?.id === userId;

      // ✅ Single-player lobby: immediately create game
      if (updatedLobby.single && isCreator && !gameId) {
        console.log("Single-player lobby: creating game immediately");
        createGame().catch(console.error);
        return;
      }

      // ✅ Multi-player: wait for at least 2 users
      if (!updatedLobby.single && isCreator && userCount > 1 && !gameId) {
        createGame().catch(console.error);
      }
    });

    client.subscribe(`/topic/lobby/${lobbyId}/gameCreated`, (msg) => {
      const { gameId: newGameId } = JSON.parse(msg.body);
      setGameId(newGameId);
      navigate(`/multiplayer/${newGameId}`);
    });

    client.publish({
      destination: "/app/lobby/join",
      body: JSON.stringify({ lobbyId, userId, characterId: passedCharacterId }),
    });
  };

  stompClientRef.current = client;
  client.activate();

  return () => {
    client.deactivate();
  };
}, [lobbyId, userId, navigate, gameId]);


  // UI Actions
  const handleInviteClick = () => setShowFriendsModal(true);
  const closeModal = () => setShowFriendsModal(false);

  return (
    <div className="lobby-container">
      <h3>Lobby Link: http://localhost:3000/lobby/{lobbyId}</h3>

      {lobby ? (
        <>
          <p><strong>Map:</strong> {lobby.map}</p>
          <p><strong>Code:</strong> {lobby.code}</p>
          <p><strong>Owner:</strong> {lobby.ownerId}</p>

          <h2>Joined Users:</h2>
          <div className="user-list">
            {joinedUsers.map((user) => (
              <div key={user.id} className="user-item">
                {user.icon && <img src={user.icon} alt={user.username} className="user-avatar" />}
                <p className="username">{user.username}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <Box className="invite-btn" sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 1, opacity: 0.8, cursor: "not-allowed",
              backgroundColor: "rgba(207,78,10,0.8)", borderRadius: "6px",
              padding: "8px 16px", color: "white", fontWeight: "bold"
            }}>
              <CircularProgress size={18} sx={{ color: "white" }} />
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>Loading game...</Typography>
            </Box>
          ) : (
            <Box className="invite-btn" onClick={handleInviteClick} sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "rgb(207,78,10)", borderRadius: "6px",
              padding: "8px 16px", color: "white", fontWeight: "bold",
              cursor: "pointer", "&:hover": { backgroundColor: "rgb(207,78,10)" }
            }}>
              Invite Friends
            </Box>
          )}
        </>
      ) : (
        <p>Loading lobby info...</p>
      )}

      {showFriendsModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Your Friends</h2>

            {friends.length > 0 ? (
              <ul className="friend-list">
                {friends.map((friend) => (
                  <li key={friend.id} className="friend-item">
                    {friend.icon && <img src={friend.icon} alt={friend.username} className="friend-avatar" />}
                    <span>{friend.username}</span>
                    <button className="send-invite-btn" onClick={() => sendInvite(friend.id, friend.username)}>Invite</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No friends found.</p>
            )}

            <button className="close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lobby;
