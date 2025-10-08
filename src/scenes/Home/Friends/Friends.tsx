import React, { useEffect, useState } from "react";
import {
  Badge,
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
import {
  People,
  PersonRemove,
  Block,
  Chat,
  HourglassEmpty,
  LockOpen,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";

type Friend = {
  id: string;
  username: string;
  email: string;
  friendRequestIds?: string[];
  blockedIds?: string[];
};

export default function FriendsPage() {
  const [openFind, setOpenFind] = useState(false);
  const [openPending, setOpenPending] = useState(false);
  const [openBlocked, setOpenBlocked] = useState(false);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [others, setOthers] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Friend[]>([]);
  const [blockedByUsers, setBlockedByUsers] = useState<Friend[]>([]);

  const currentUserEmail = useSelector(
    (state: RootState) => state.auth.user.email
  );

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

        const friendIds = userData.friendIds || [];
        const requestIds = userData.friendRequestIds || [];
        const blockedIds = userData.blockedIds || [];

        // Incoming requests = users who sent requests to current user
        const incoming = allUsers.filter((u: Friend) =>
          requestIds.includes(u.id)
        );

        // Sent requests = users who have current user's ID in their friendRequestIds
        const sent = allUsers.filter(
          (u: Friend) =>
            Array.isArray(u.friendRequestIds) &&
            u.friendRequestIds.includes(userData.id)
        );

        // Friends list
        const friendList = allUsers.filter((u: Friend) =>
          friendIds.includes(u.id)
        );

        const blockedList = allUsers.filter((u: Friend) =>
          blockedIds.includes(u.id)
        );

        // Others = not friends, not in pending
        const nonFriends = allUsers.filter(
          (u: Friend) =>
            u.email !== currentUserEmail &&
            !friendIds.includes(u.id) &&
            !requestIds.includes(u.id) &&
            !(u.friendRequestIds || []).includes(userData.id) &&
            !blockedIds.includes(u.id) &&
            !(u.blockedIds || []).includes(userData.id)
        );

        // Users who have blocked me
        const blockedByList = allUsers.filter(
          (u: Friend) =>
            Array.isArray(u.blockedIds) && u.blockedIds.includes(userData.id)
        );

        setFriends(friendList);
        setOthers(nonFriends);
        setSentRequests(sent);
        setIncomingRequests(incoming);
        setBlockedUsers(blockedList);
        setBlockedByUsers(blockedByList);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    fetchFriends();
  }, []);

  const handleAddFriend = async (user: Friend) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/sendFriendRequest/${currentUserEmail}/${user.email}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Failed to send friend request");

      alert(`Friend request sent to ${user.username}`);
      setSentRequests((prev) => [...prev, user]);
      setOthers((prev) => prev.filter((o) => o.id !== user.id));
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  const handleCancelRequest = async (user: Friend) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/cancelFriendRequest/${currentUserEmail}/${user.email}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Failed to cancel request");
      setSentRequests((prev) => prev.filter((r) => r.id !== user.id));
      setOthers((prev) => [...prev, user]);
      alert(`Friend request to ${user.username} canceled.`);
    } catch (err) {
      console.error("Error canceling friend request:", err);
    }
  };

  const handleApproveRequest = async (user: Friend) => {
    await fetch(
      `http://localhost:8080/api/users/approveFriendRequest/${currentUserEmail}/${user.id}`,
      { method: "PUT" }
    );
    setIncomingRequests((prev) => prev.filter((r) => r.id !== user.id));
    setFriends((prev) => [...prev, user]);
  };

  const handleRejectRequest = async (user: Friend) => {
    await fetch(
      `http://localhost:8080/api/users/rejectFriendRequest/${currentUserEmail}/${user.id}`,
      { method: "PUT" }
    );
    setIncomingRequests((prev) => prev.filter((r) => r.id !== user.id));
  };

  const handleRemoveFriend = async (friend: Friend) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/removeFriend/${currentUserEmail}/${friend.id}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Failed to remove friend");
      setFriends((prev) => prev.filter((f) => f.id !== friend.id));
      setOthers((prev) => [...prev, friend]);
      alert(`You and ${friend.username} are no longer friends.`);
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  const handleBlockFriend = async (friend: Friend) => {
    if (!window.confirm(`Are you sure you want to block ${friend.username}?`))
      return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/users/blockUser/${currentUserEmail}/${friend.id}`,
        { method: "PUT" }
      );

      if (!res.ok) throw new Error("Failed to block user");

      alert(`${friend.username} has been blocked.`);

      // Remove and update state
      setFriends((prev) => prev.filter((f) => f.id !== friend.id));
      setOthers((prev) => prev.filter((o) => o.id !== friend.id));
      setBlockedUsers((prev) => [...prev, friend]); // 👈 update immediately
    } catch (err) {
      console.error("Error blocking user:", err);
    }
  };

  const handleUnblockUser = async (user: Friend) => {
    if (!window.confirm(`Do you want to unblock ${user.username}?`)) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/users/unblockUser/${currentUserEmail}/${user.id}`,
        { method: "PUT" }
      );

      if (!res.ok) throw new Error("Failed to unblock user");

      alert(`${user.username} has been unblocked.`);

      // Update local state
      setBlockedUsers((prev) => prev.filter((u) => u.id !== user.id));
      setOthers((prev) => [...prev, user]); // 👈 add back to "Add Friends"
    } catch (err) {
      console.error("Error unblocking user:", err);
    }
  };

  return (
    <div className="friends" style={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mt: 2 }}>
        Friends
      </Typography>

      {/* ---- FRIENDS LIST ---- */}
      <Stack spacing={2} sx={{ mt: 2 }}>
        {friends.length === 0 ? (
          <Typography color="text.secondary">No friends yet</Typography>
        ) : (
          friends.map((friend) => (
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
                    onClick={() => handleBlockFriend(friend)}
                  >
                    <Block />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))
        )}
      </Stack>

      {/* ---- ACTION BUTTONS ---- */}
      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<People />}
          onClick={() => setOpenFind(true)}
        >
          Add Friends
        </Button>

        <Badge
          color="error"
          variant={incomingRequests.length > 0 ? "dot" : "standard"}
          overlap="rectangular"
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            "& .MuiBadge-dot": {
              height: 15,
              minWidth: 15,
              borderRadius: "50%",
              right: 1,
              top: 1,
            },
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<HourglassEmpty />}
            onClick={() => setOpenPending(true)}
          >
            Pending Requests
          </Button>
        </Badge>

        <Button
          variant="outlined"
          color="error"
          startIcon={<LockOpen />}
          onClick={() => setOpenBlocked(true)}
        >
          Blocked
        </Button>
      </Box>

      {/* ---- ADD FRIENDS DIALOG ---- */}
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
                    Send Request
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

      {/* ---- COMBINED PENDING REQUESTS DIALOG ---- */}
      <Dialog
        open={openPending}
        onClose={() => setOpenPending(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgb(255, 225, 180)",
            boxShadow: "none",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>Pending Friend Requests</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {incomingRequests.length === 0 && sentRequests.length === 0 ? (
              <Typography color="text.secondary">
                No pending friend requests.
              </Typography>
            ) : (
              <>
                {/* INCOMING */}
                {incomingRequests.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Received Requests
                    </Typography>
                    {incomingRequests.map((req) => (
                      <Box
                        key={req.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body1">{req.username}</Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleApproveRequest(req)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRejectRequest(req)}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </>
                )}

                {/* SENT */}
                {sentRequests.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Sent Requests
                    </Typography>
                    {sentRequests.map((req) => (
                      <Box
                        key={req.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body1">{req.username}</Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCancelRequest(req)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ))}
                  </>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPending(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ---- BLOCKED USERS DIALOG ---- */}
      <Dialog
        open={openBlocked}
        onClose={() => setOpenBlocked(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgb(255, 220, 220)",
            boxShadow: "none",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>Blocked Users</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={4}>
            {/* USERS YOU HAVE BLOCKED */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Users You Have Blocked
              </Typography>
              {blockedUsers.length === 0 ? (
                <Typography color="text.secondary">
                  You haven’t blocked anyone.
                </Typography>
              ) : (
                blockedUsers.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">{user.username}</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => handleUnblockUser(user)}
                    >
                      Unblock
                    </Button>
                  </Box>
                ))
              )}
            </Box>

            {/* USERS WHO BLOCKED YOU */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Users Who Blocked You
              </Typography>
              {blockedByUsers.length === 0 ? (
                <Typography color="text.secondary">
                  No one has blocked you.
                </Typography>
              ) : (
                blockedByUsers.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">{user.username}</Typography>
                  </Box>
                ))
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBlocked(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
