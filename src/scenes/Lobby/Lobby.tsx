import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function Lobby() {
  const [joinedUsers, setJoinedUsers] = useState<string[]>([]);
  const [userId] = useState<string>(() => generateRandomId());

  useEffect(() => {
    // Create STOMP client
    const stompClient = new Client({
      // brokerURL is undefined because we use SockJS
      brokerURL: undefined,
      connectHeaders: {},
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    });

    // Called when connected
    stompClient.onConnect = () => {
      console.log("Connected to WebSocket");

      // Subscribe to lobby updates
      stompClient.subscribe("/topic/lobby", (message) => {
        setJoinedUsers((prev) => [...prev, message.body]);
      });

      // Auto-join lobby
      stompClient.publish({ destination: "/app/lobby/join", body: userId });
    };

    // Activate the client
    stompClient.activate();

    // Cleanup on unmount
    return () => {
      stompClient.deactivate();
    };
  }, [userId]);

  // Generate a random string for user ID
  function generateRandomId(length = 8) {
    return Math.random().toString(36).substr(2, length).toUpperCase();
  }

  return (
    <div>
      <h1>Lobby</h1>
      <p>Your ID: {userId}</p>
      <ul>
        {joinedUsers.map((id, i) => (
          <li key={i}>{id}</li>
        ))}
      </ul>
    </div>
  );
}

export default Lobby;
