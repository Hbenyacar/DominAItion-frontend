import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import "./FriendPopup.css"; // you can style like InvitePopup.css

interface FriendNotification {
  userId: string;
  username: string;
  notificationsEnabled: boolean;
}

export default function FriendListener() {
  const [notification, setNotification] = useState<FriendNotification | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userId = currentUser?.id;

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    if (!userId) return;

    const stompClient = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    stompClient.onConnect = () => {
      console.log("FriendListener connected");

      // Subscribe to friend-login notifications
        stompClient.subscribe(`/topic/user/${userId}/notifications`, (msg) => {
        const data: FriendNotification = JSON.parse(msg.body);
        console.log("Parsed data:",data)
        setNotification({
            userId: data.userId,
            username: data.username,
            notificationsEnabled: data.notificationsEnabled
        });

        setTimeout(() => setNotification(null), 5000);
        });
    };

    stompClient.activate();

    return () => void stompClient.deactivate();
  }, [userId]);

  if (!notification) return null;

  return (
    <>
        {notification?.notificationsEnabled && (
        <div className="friend-login-popup">
            <p>{`${notification.username} just logged in!`}</p>
        </div>
        )}
    </>
  );
}