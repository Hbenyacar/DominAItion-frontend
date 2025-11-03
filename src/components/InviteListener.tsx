import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import "./InvitePopup.css";

interface InviteMessage {
  senderId: string;
  senderName: string;
  lobbyId: string;
}

export default function InviteListener() {
  const [invite, setInvite] = useState<InviteMessage | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const userId = currentUser?.id;

  useEffect(() => {
    if (!userId) return;

    const stompClient = new Client({
      brokerURL: undefined,
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    stompClient.onConnect = () => {
      console.log("Invite listener connected");
      stompClient.subscribe(`/topic/invites/${userId}`, (msg) => {
        const inviteMsg: InviteMessage = JSON.parse(msg.body);
        setInvite(inviteMsg);

        // Auto-hide after 5 seconds
        setTimeout(() => setInvite(null), 5000);
      });
    };

    stompClient.activate();
    return () => void stompClient.deactivate();
  }, [userId]);

  if (!invite) return null;

  return (
    <div className="invite-popup">
      <p><strong>{invite.senderName}</strong> invited you to join a lobby!</p>
      <a href={`/lobby/${invite.lobbyId}`} className="join-btn">
        Join
      </a>
    </div>
  );
}
