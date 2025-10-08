import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";

type ChatMessage = {
  chatId?: string;
  senderId: string;
  contents: string;
  time?: string;
  isRead?: boolean;
};

type Chat = {
  id: string;
  members: string[];
  messageIds: string[];
};

type Friend = {
  id: string;
  email: string;
  username: string;
};

export default function Messages() {
  const [currentUserId, setCurrentUserId] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [openChat, setOpenChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingNewChat, setStartingNewChat] = useState(false);
  const [selectedNewFriend, setSelectedNewFriend] = useState("");

  const currentUserEmail = useSelector(
    (state: RootState) => state.auth.user.email
  );

  const normalizeMessage = (m: any) => ({
    ...m,
    isRead: m.isRead ?? m.read ?? false, // handle either format safely
  });

  const normalizeMessages = (arr: any[]) =>
    Array.isArray(arr) ? arr.map(normalizeMessage) : [];

  //  Fetch user, chats, and friends
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        // 1️⃣ Get current user
        const userRes = await fetch(
          `http://localhost:8080/api/users/email/${currentUserEmail}`
        );
        const user = await userRes.json();
        setCurrentUserId(user.id);

        // 2️⃣ Fetch chats and friends in parallel
        const [chatRes, friendRes] = await Promise.all([
          fetch(`http://localhost:8080/api/chats/${user.id}`),
          fetch(`http://localhost:8080/api/users/friends/${currentUserEmail}`),
        ]);

        const chatData = await chatRes.json();
        const friendData = await friendRes.json();

        // Normalize friends (backend returns "name")
        const normalizedFriends = friendData.map((f: any) => ({
          id: f.id,
          email: f.email,
          username: f.name,
        }));

        setChats(Array.isArray(chatData) ? chatData : []);
        setFriends(Array.isArray(normalizedFriends) ? normalizedFriends : []);

        // 3️⃣ Fetch messages for all chats (to display unread counts)
        for (const chat of chatData) {
          const msgRes = await fetch(
            `http://localhost:8080/api/chats/${chat.id}/messages`
          );
          const msgRaw = await msgRes.json();
          const msgData = normalizeMessages(msgRaw); // ✅ normalize
          setMessages((prev) => ({ ...prev, [chat.id]: msgData }));
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, [currentUserEmail]);

  const getUnreadCount = (chatId: string) => {
    const chatMsgs = messages[chatId] || [];
    return chatMsgs.filter((m) => m.senderId !== currentUserId && !m.isRead)
      .length;
  };

  const openChatWindow = async (chat: Chat) => {
    setSelectedChat(chat);
    const friendId = chat.members.find((m) => m !== currentUserId);
    const friend = friends.find((f) => f.id === friendId);
    setSelectedFriend(friend || null);
    setOpenChat(true);

    try {
      // 1️⃣ Mark all unread messages as read in backend
      await fetch(
        `http://localhost:8080/api/chats/${chat.id}/mark-read/${currentUserId}`,
        { method: "PUT" }
      );

      // 2️⃣ Re-fetch updated messages from backend (fresh data)
      const res = await fetch(
        `http://localhost:8080/api/chats/${chat.id}/messages`
      );
      const msgsRaw = await res.json();
      const msgs = normalizeMessages(msgsRaw); // ✅ normalize
      setMessages((prev) => ({ ...prev, [chat.id]: msgs }));

      // 4️⃣ Force React to re-render with updated messages
      setChats((prev) => [...prev]); // triggers re-render for badges
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleStartChat = async () => {
    if (!selectedNewFriend || !currentUserId) return;
    try {
      const res = await fetch("http://localhost:8080/api/chats/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: [currentUserId, selectedNewFriend],
        }),
      });

      const newChat = await res.json();
      setChats((prev) => [...prev, newChat]);
      setStartingNewChat(false);
      setSelectedNewFriend("");

      const friend = friends.find((f) => f.id === selectedNewFriend);
      setSelectedFriend(friend || null);
      setSelectedChat(newChat);
      setOpenChat(true);
    } catch (err) {
      console.error("Error starting new chat:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || newMessage.trim() === "" || !currentUserId) return;

    const msg = {
      senderId: currentUserId,
      contents: newMessage,
      isRead: true, // mark sender's own as read
    };

    try {
      const res = await fetch(
        `http://localhost:8080/api/chats/${selectedChat.id}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg),
        }
      );

      const savedRaw = await res.json();
      const saved = normalizeMessage(savedRaw); // ✅ normalize
      setMessages((prev) => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), saved],
      }));

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const availableFriendsForChat = friends.filter(
    (f) => !chats.some((c) => c.members.includes(f.id))
  );

  const getLastMessageTime = (chatId: string): number => {
    const chatMsgs = messages[chatId] || [];
    if (chatMsgs.length === 0) return 0; // no messages yet
    const lastMsg = chatMsgs[chatMsgs.length - 1];
    return new Date(lastMsg.time || 0).getTime();
  };

  useEffect(() => {
    const container = document.querySelector(".chat-scroll-container");
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, selectedChat]);

  return (
    <div className="messages" style={{ flexGrow: 1 }}>
      <h1>Messages</h1>

      {loading ? (
        <Typography sx={{ mt: 2 }}>Loading chats...</Typography>
      ) : chats.length === 0 ? (
        <>
          <Typography sx={{ mt: 2 }}>
            You don’t have any conversations yet.
          </Typography>
          {availableFriendsForChat.length > 0 && (
            <Button
              variant="contained"
              sx={{ mt: 2, backgroundColor: "rgb(207, 78, 10)" }}
              onClick={() => setStartingNewChat(true)}
            >
              Start a New Chat
            </Button>
          )}
        </>
      ) : (
        <>
          {/* 💬 Conversation List */}
          <Stack spacing={2} sx={{ mt: 2 }}>
            {[...chats]
              .sort((a, b) => {
                // Count unread for each chat
                const unreadA = getUnreadCount(a.id);
                const unreadB = getUnreadCount(b.id);

                // If one has unread messages, show that chat first
                if (unreadA > 0 && unreadB === 0) return -1;
                if (unreadB > 0 && unreadA === 0) return 1;

                // Otherwise sort by last message time (descending)
                const lastA = getLastMessageTime(a.id);
                const lastB = getLastMessageTime(b.id);
                return lastB - lastA;
              })
              .map((chat) => {
                const friendId = chat.members.find((m) => m !== currentUserId);
                const friend = friends.find((f) => f.id === friendId);
                const unreadCount = getUnreadCount(chat.id); // uses backend isRead

                return (
                  <Box
                    key={chat.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 1.2,
                      borderRadius: 1,
                      border: "1px solid #eee",
                      backgroundColor: "#fff",
                      transition: "0.2s",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.04)",
                      },
                    }}
                    onClick={() => openChatWindow(chat)}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      {friend?.username || "Unknown User"}
                    </Typography>

                    {/* red badge showing unread messages */}
                    {unreadCount > 0 && (
                      <Badge
                        badgeContent={unreadCount}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            right: -12,
                            top: -20,
                            fontSize: "0.7rem",
                            minWidth: "18px",
                            height: "18px",
                          },
                        }}
                      />
                    )}
                  </Box>
                );
              })}
          </Stack>

          <Button
            variant="contained"
            sx={{ mt: 3, backgroundColor: "rgb(207, 78, 10)" }}
            onClick={() => setStartingNewChat(true)}
          >
            Start a New Chat
          </Button>
        </>
      )}

      {/* 🟠 Start New Chat Dialog */}
      <Dialog
        open={startingNewChat}
        onClose={() => setStartingNewChat(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Start a New Conversation</DialogTitle>
        <DialogContent>
          {availableFriendsForChat.length > 0 ? (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select a Friend</InputLabel>
              <Select
                value={selectedNewFriend}
                label="Select a Friend"
                onChange={(e) => setSelectedNewFriend(e.target.value)}
              >
                {availableFriendsForChat.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.username}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  backgroundColor: "rgb(207, 78, 10)",
                  "&:hover": { backgroundColor: "darkorange" },
                }}
                onClick={handleStartChat}
                disabled={!selectedNewFriend}
              >
                Start Chat
              </Button>
            </FormControl>
          ) : (
            <Typography sx={{ mt: 2 }}>
              All your friends already have active chats!
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* 💬 Chat Window Dialog */}
      <Dialog
        open={openChat}
        onClose={() => setOpenChat(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: "70vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgb(255, 195, 149)",
          },
        }}
      >
        <DialogTitle>
          Chat with {selectedFriend?.username || "Unknown User"}
        </DialogTitle>

        <DialogContent
          className="chat-scroll-container"
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {selectedChat &&
          messages[selectedChat.id] &&
          messages[selectedChat.id].length > 0 ? (
            messages[selectedChat.id].map((msg, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf:
                    msg.senderId === currentUserId ? "flex-end" : "flex-start",
                  backgroundColor:
                    msg.senderId === currentUserId
                      ? "rgb(207, 78, 10)"
                      : "rgba(0,0,0,0.1)",
                  color: msg.senderId === currentUserId ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: 2,
                  maxWidth: "70%",
                }}
              >
                <Typography variant="body2">{msg.contents}</Typography>
                {msg.time && (
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.7rem", opacity: 0.7 }}
                  >
                    {new Date(msg.time).toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography color="text.secondary" align="center">
              No messages yet. Start the conversation!
            </Typography>
          )}
        </DialogContent>

        {/* 📨 Message Input */}
        {selectedChat && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              padding: 2,
              borderTop: "1px solid #ddd",
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                flexGrow: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              sx={{
                backgroundColor: "rgb(207, 78, 10)",
                "&:hover": { backgroundColor: "darkorange" },
                color: "white",
              }}
            >
              Send
            </Button>
          </Box>
        )}
      </Dialog>
    </div>
  );
}
