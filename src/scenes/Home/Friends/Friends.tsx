import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { People, PersonRemove, Block, Chat } from "@mui/icons-material";

type Friend = {
  id: string;
  username: string;
  email: string;
};

export default function FriendsPage() {
  const [openFind, setOpenFind] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [others, setOthers] = useState<Friend[]>([]);

  // hardcoded current user for now
  const currentUserEmail = "jackrdar@gmail.com";

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // get current user
        const userRes = await fetch(
          `http://localhost:8080/api/users/email/${currentUserEmail}`
        );
        const userData = await userRes.json();

        // get all users
        const allRes = await fetch("http://localhost:8080/api/users");
        const allUsers = await allRes.json();

        // get friends by matching friendIds
        const friendIds: string[] = userData.friendIds || [];
        const friendList = allUsers.filter((u: Friend) =>
          friendIds.includes(u.id)
        );

        // others = everyone except current user and friends
        const nonFriends = allUsers.filter(
          (u: Friend) =>
            u.email !== currentUserEmail && !friendIds.includes(u.id)
        );

        setFriends(friendList);
        setOthers(nonFriends);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    fetchFriends();
  }, []);

  const handleAddFriend = async (user: Friend) => {
    try {
      // 1️⃣  Persist to backend
      const res = await fetch(
        `http://localhost:8080/api/users/addFriend/${currentUserEmail}/${user.id}`,
        { method: "PUT" }
      );

      if (!res.ok) {
        throw new Error("Failed to add friend");
      }

      // 2️⃣  Update frontend state
      setFriends((prev) => [...prev, user]);
      setOthers((prev) => prev.filter((o) => o.id !== user.id));
    } catch (err) {
      console.error("Error adding friend:", err);
    }
  };

  const handleRemoveFriend = async (friend: Friend) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/removeFriend/${currentUserEmail}/${friend.id}`,
        { method: "PUT" }
      );
      if (!res.ok) {
        throw new Error("Failed to remove friend");
      }

      // Update state locally
      setFriends((prev) => prev.filter((f) => f.id !== friend.id));
      setOthers((prev) => [...prev, friend]);
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  return (
    <div className="friends" style={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mt: 2 }}>
        Friends
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {friends.length === 0 && (
          <Typography color="text.secondary">No friends yet</Typography>
        )}
        {friends.map((friend) => (
          <Box
            key={friend.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 1,
              borderBottom: "1px solid #eee",
            }}
          >
            <Typography variant="body1">{friend.username}</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Message">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => alert(`Messaging ${friend.username}`)}
                >
                  <Chat />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveFriend(friend)}
                >
                  <PersonRemove />
                </IconButton>
              </Tooltip>
              <Tooltip title="Block">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => alert(`Blocked ${friend.username}`)}
                >
                  <Block />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<People />}
          onClick={() => setOpenFind(true)}
        >
          Add Friends
        </Button>
      </Box>

      {/* Add Friends Dialog */}
      <Dialog
        open={openFind}
        onClose={() => setOpenFind(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgb(255, 195, 149)",
            boxShadow: "none",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>Add Friends</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {others.length === 0 ? (
              <Typography color="text.secondary">
                No more users to add
              </Typography>
            ) : (
              others.map((user) => (
                <Box
                  key={user.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1">{user.username}</Typography>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleAddFriend(user)}
                  >
                    Add
                  </Button>
                </Box>
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFind(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
