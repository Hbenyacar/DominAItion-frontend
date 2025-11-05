import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import "./Lobby.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

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
}

function Lobby() {
  const params = useParams<{ lobbyId: string }>();
  const lobbyId = params.lobbyId;
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [joinedUsers, setJoinedUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  const stompClientRef = useRef<Client | null>(null); // ✅ shared reference

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userId = currentUser?.id;

  // ✅ Function can now access stompClientRef.current
  const sendInvite = (friendId: string, friendName: string) => {
    const stompClient = stompClientRef.current;
    if (!stompClient || !stompClient.connected || !userId || !currentUser?.username)
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

  const [winningPoints, setWinningPoints] = useState(20);
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const createGame = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winningPoints }),
      });

      if (!response.ok) throw new Error("Failed to create game");

      const data = await response.text(); // backend returns String
      setGameId(data);
      console.log("Game created:", data);
      navigate(`/game/${data}`);
    } catch (err) {
      console.error("Error creating game:", err);
      alert("Error creating game");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch user’s friends
  useEffect(() => {
    if (!userId) return;
    const fetchFriends = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/friends/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch friends");
        const data: User[] = await res.json();
        setFriends(data);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };
    fetchFriends();

  }, [userId]);

  // ✅ Setup WebSocket
  useEffect(() => {
    if (!lobbyId || !userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      console.log("Connected to WebSocket");

      client.subscribe(`/topic/lobby/${lobbyId}`, (message) => {
        const updatedLobby: Lobby = JSON.parse(message.body);
        setLobby(updatedLobby);
        setJoinedUsers(updatedLobby.users || []);
        if (updatedLobby.users.length == 1) {
          createGame();
        }
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
      <h1>Lobby Link: http://localhost:3000/lobby/{lobbyId}</h1>

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
                  <img src={user.icon} alt={user.username} className="user-avatar" />
                )}
                <p className="username">{user.username}</p>
              </div>
            ))}
          </div>

          <button className="invite-btn" onClick={handleInviteClick}>
            Invite Friends
          </button>
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
                      <img src={friend.icon} alt={friend.username} className="friend-avatar" />
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
