import React, { useState } from "react";
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
  id: number;
  name: string;
};

export default function FriendsPage() {
  const [openFind, setOpenFind] = useState(false);

  const [friends, setFriends] = useState<Friend[]>([
    { id: 1, name: "Michael Corleone" },
    { id: 2, name: "Ron Burgundy" },
    { id: 3, name: "Daniel Plainview" },
  ]);

  const [others, setOthers] = useState<Friend[]>([
    { id: 4, name: "Tony Stark" },
    { id: 5, name: "Bruce Wayne" },
    { id: 6, name: "Atticus Finch" },
  ]);

  const handleAddFriend = (user: Friend) => {
    setFriends((prev) => [...prev, user]);
    setOthers((prev) => prev.filter((o) => o.id !== user.id));
  };

  return (
    <div className="friends" style={{ flexGrow: 1 }}>
      <h1>Friends</h1>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {friends.map((friend) => (
          <Box
            key={friend.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 1,
              borderBottom: "1px solid #eee",
              gap: 2,
            }}
          >
            <Typography variant="body1">{friend.name}</Typography>
            <Box sx={{ marginLeft: "auto", display: "flex", gap: 1 }}>
              <Tooltip title="Message">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => alert(`Messaging ${friend.name}`)}
                >
                  <Chat />
                </IconButton>
              </Tooltip>

              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => alert(`Removed ${friend.name}`)}
                >
                  <PersonRemove />
                </IconButton>
              </Tooltip>

              <Tooltip title="Block">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => alert(`Blocked ${friend.name}`)}
                >
                  <Block />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Add Friends Button */}
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
            backgroundColor: "rgb(255, 195, 149)", // same as your theme
            boxShadow: "none",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>Add Friends</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {others.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No more users to add
              </Typography>
            )}
            {others.map((user) => (
              <Box
                key={user.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">{user.name}</Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAddFriend(user)}
                >
                  Add
                </Button>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFind(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
