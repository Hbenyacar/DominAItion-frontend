import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import "./Lobby.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

interface User {
  id: string;
  username: string;
  icon?: string;
}

function Lobby() {
  const params = useParams<{ lobbyId: string }>();
  const lobbyId = params.lobbyId;
  const [joinedUsers, setJoinedUsers] = useState<User[]>([]);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userId = currentUser?.id;

  useEffect(() => {
    if (!lobbyId || !userId) return;

    const stompClient = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    stompClient.onConnect = () => {
      console.log("Connected to WebSocket");

      stompClient.subscribe(`/topic/lobby/${lobbyId}`, (message) => {
        const users: User[] = JSON.parse(message.body);
        console.log("Users received:", users);
        setJoinedUsers(Array.isArray(users) ? users : []);
      });

      // Notify server user has joined
      stompClient.publish({
        destination: "/app/lobby/join",
        body: JSON.stringify({ lobbyId, userId }),
      });
    };

    stompClient.activate();

    // ✅ Proper synchronous cleanup
    return () => {
      void stompClient.deactivate(); // ignore returned Promise safely
    };
  }, [lobbyId, userId]);

  if (!lobbyId) return <div>No lobby selected.</div>;
  if (!userId) return <div>Loading user...</div>;

  return (
    <div className="lobby-container">
      <h1>Lobby: {lobbyId}</h1>
      <p>Your ID: {userId}</p>

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
    </div>
  );
}

export default Lobby;
