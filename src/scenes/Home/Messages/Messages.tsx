import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

type Friend = {
  id: number;
  name: string;
};

type ChatMessage = {
  sender: string;
  text: string;
};

interface MessagesPageProps {
  friends: Friend[];
}

export default function Messages({ friends }: MessagesPageProps) {
  const [chats, setChats] = useState<Record<number, ChatMessage[]>>({
    1: [
      {
        sender: "Michael Corleone",
        text: "I’m gonna make him an offer he can’t refuse.",
      },
      { sender: "You", text: "Bing bow" },
    ],
    2: [
      { sender: "Ron Burgundy", text: "Stay classy, San Diego!" },
      { sender: "You", text: "Ron...." },
    ],
    3: [
      { sender: "Daniel Plainview", text: "I drink your milkshake!" },
      { sender: "You", text: "Yeah but didn't you abandon your child???" },
    ],
  });

  const [openChat, setOpenChat] = useState(false);
  const [selectedChatFriend, setSelectedChatFriend] = useState<Friend | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (selectedChatFriend && newMessage.trim() !== "") {
      setChats((prev) => ({
        ...prev,
        [selectedChatFriend.id]: [
          ...(prev[selectedChatFriend.id] || []),
          { sender: "You", text: newMessage },
        ],
      }));
      setNewMessage("");
    }
  };

  return (
    <div className="messages" style={{ flexGrow: 1 }}>
      <h1>Messages</h1>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {friends.map((friend) => (
          <Box
            key={friend.id}
            sx={{
              padding: 1,
              borderBottom: "1px solid #eee",
              cursor: "pointer",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
            }}
            onClick={() => {
              setSelectedChatFriend(friend);
              setOpenChat(true);
            }}
          >
            <Typography variant="body1">{friend.name}</Typography>
          </Box>
        ))}
      </Stack>

      {/* Chat Window */}
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
            backgroundColor: "rgb(255, 195, 149)", // same as Friends dialog
          },
        }}
      >
        <DialogTitle>Chat with {selectedChatFriend?.name}</DialogTitle>

        <DialogContent
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {selectedChatFriend &&
            chats[selectedChatFriend.id]?.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
                  backgroundColor:
                    msg.sender === "You"
                      ? "rgb(207, 78, 10)"
                      : "rgba(0,0,0,0.1)",
                  color: msg.sender === "You" ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: 2,
                  maxWidth: "70%",
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            ))}
        </DialogContent>

        {/* Input area */}
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
              backgroundColor: "rgb(207, 78, 10)", // same as outgoing msg color
              "&:hover": { backgroundColor: "darkorange" },
              color: "white",
            }}
          >
            Send
          </Button>
        </Box>
      </Dialog>
    </div>
  );
}
