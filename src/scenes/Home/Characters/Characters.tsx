// src/pages/Home/Characters/Characters.tsx

import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {playSound} from "../../../utils/sound";

const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/";

type Character = {
    id: string; // stored, used for key and delete
    creatorID: string;
    characterName: string;
    characterBio: string;
    intelligence: number;
    wisdom: number;
    charisma: number;
    strength: number;
    ingenuity: number;
};

export default function CharactersPage() {
    const currentUserEmail = useSelector(
        (state: RootState) => state.auth.user?.email || null
    );

    const [userId, setUserId] = useState<string | null>(null);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state for creating a character
    const [openCreate, setOpenCreate] = useState(false);
    const [newDescription, setNewDescription] = useState("");
    const [creating, setCreating] = useState(false);

    // 🔁 Helper to load characters for a given user
    const loadCharacters = async (uid: string) => {
        setLoading(true);
        try {
            const charRes = await fetch(`${API_BASE_URL}/api/characters/${uid}`);
            if (!charRes.ok) throw new Error("Failed to fetch characters");

            const list: Character[] = await charRes.json();
            setCharacters(list);
            setError(null);
        } catch (err) {
            console.error("Error fetching characters:", err);
            setError("Failed to load characters.");
        } finally {
            setLoading(false);
        }
    };

    // 🧑 Fetch current user to get userId
    useEffect(() => {
        const fetchUser = async () => {
            if (!currentUserEmail) {
                setError("Unable to determine current user.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/users/email/${currentUserEmail}`
                );
                if (!res.ok) throw new Error("Failed to fetch current user");

                const userData = await res.json();
                setUserId(userData.id);
            } catch (err) {
                console.error("Error fetching current user:", err);
                setError("Failed to load user info.");
                setLoading(false);
            }
        };

        fetchUser();
    }, [currentUserEmail]);

    // 🎒 Once we have userId, load their characters
    useEffect(() => {
        if (!userId) return;
        loadCharacters(userId);
    }, [userId]);

    // 🗑 DELETE CHARACTER (GET endpoint)
    const handleDeleteCharacter = async (characterId: string) => {
        const confirm = window.confirm(
            "Are you sure you want to delete this character?"
        );
        if (!confirm) return;

        try {
            const res = await fetch(
                `${API_BASE_URL}/api/characters/delete/${characterId}`,
                {
                    method: "GET", // backend treats delete as GET
                }
            );

            if (!res.ok) throw new Error("Failed to delete character");

            setCharacters((prev) => prev.filter((c) => c.id !== characterId));
            toast.info("Character deleted.");
        } catch (err) {
            console.error("Error deleting character:", err);
            toast.error("Failed to delete character.");
        }
    };

    // ➕ OPEN / CLOSE CREATE MODAL
    const handleOpenCreate = () => {
        setNewDescription("");
        setOpenCreate(true);
    };

    const handleCloseCreate = () => {
        if (!creating) {
            setOpenCreate(false);
        }
    };

    // ✨ CREATE CHARACTER
    const handleCreateCharacter = async () => {
        if (!userId) {
            toast.error("Unable to determine user. Please try again.");
            return;
        }
        if (!newDescription.trim()) {
            toast.error("Please enter a character description.");
            return;
        }

        try {
            setCreating(true);

            alert(userId)
            alert(newDescription.trim())

            const res = await fetch(`${API_BASE_URL}/api/ai/character`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    request: newDescription.trim(),
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create character");
            }

            toast.success("Character created!");

            try {
                playSound("/assets/sound_effects/character_upload.mp3");
            } catch (e) {
                console.error("Failed to play lose sound", e);
            }

            // Close modal and clear input
            setOpenCreate(false);
            setNewDescription("");

            // Reload characters to include the new one
            await loadCharacters(userId);
        } catch (err) {
            console.error("Error creating character:", err);
            toast.error("Failed to create character.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="characters" style={{ flexGrow: 1, marginLeft: 30 }}>
            <Typography variant="h4" marginBottom="30px" fontWeight="bold">
                Characters
            </Typography>

            <Box
                sx={{
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 195, 149, 0.8)",
                    padding: 2,
                }}
            >
                {/* Header: Title + New Character button */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        Your Characters
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleOpenCreate}
                        sx={{
                            backgroundColor: "rgb(207, 78, 10)",
                            "&:hover": { backgroundColor: "darkorange" },
                        }}
                    >
                        New Character
                    </Button>
                </Box>

                {loading && (
                    <Typography color="text.secondary">Loading characters...</Typography>
                )}

                {error && !loading && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {!loading && !error && characters.length === 0 && (
                    <Typography color="text.secondary">
                        You don't have any characters yet.
                    </Typography>
                )}

                {!loading && !error && characters.length > 0 && (
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {characters.map((char) => (
                            <Box
                                key={char.id}
                                sx={{
                                    position: "relative",
                                    borderRadius: 2,
                                    border: "1px solid #ddd",
                                    padding: 2,
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                }}
                            >
                                {/* DELETE BUTTON */}
                                <Tooltip title="Delete Character">
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: "absolute",
                                            top: 6,
                                            right: 6,
                                            backgroundColor: "rgba(255,0,0,0.15)",
                                            "&:hover": {
                                                backgroundColor: "rgba(255,0,0,0.3)",
                                            },
                                        }}
                                        onClick={() => handleDeleteCharacter(char.id)}
                                    >
                                        <Delete color="error" />
                                    </IconButton>
                                </Tooltip>

                                {/* NAME */}
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    {char.characterName}
                                </Typography>

                                {/* BIO */}
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1.5 }}
                                >
                                    {char.characterBio}
                                </Typography>

                                {/* STATS */}
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(120px, 1fr))",
                                        gap: 1,
                                    }}
                                >
                                    <Typography variant="body2">
                                        <strong>Intelligence:</strong> {char.intelligence}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Wisdom:</strong> {char.wisdom}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Charisma:</strong> {char.charisma}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Strength:</strong> {char.strength}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Ingenuity:</strong> {char.ingenuity}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            {/* CREATE CHARACTER MODAL */}
            <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Character</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Describe the kind of character you want. The AI will generate their
                        name, bio, and stats based on your description.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        minRows={4}
                        label="Character Description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreate} disabled={creating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateCharacter}
                        variant="contained"
                        disabled={creating}
                        sx={{
                            backgroundColor: "rgb(207, 78, 10)",
                            "&:hover": { backgroundColor: "darkorange" },
                        }}
                    >
                        {creating ? "Creating..." : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toasts */}
            <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}
