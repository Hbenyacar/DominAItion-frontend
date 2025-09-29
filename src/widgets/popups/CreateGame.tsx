import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import "./CreateGame.css";

interface SimplePopupProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateGame({ open, onClose }: SimplePopupProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}   /* prevent Dialog from forcing its own maxWidth */
      PaperProps={{ className: "custom-dialog-paper" }}
    >
      <DialogTitle>Create Game</DialogTitle>
      <DialogContent>
        <p>This is a simple popup window!</p>
      </DialogContent>
      <div>
      <DialogActions>
        <Button onClick={onClose} sx={{
            color: 'rgb(255, 0, 0)',
            '&:hover': {
                background: 'rgba(255, 0, 0, .05)'
            }
        }}>Cancel</Button>
        <Button onClick={onClose}>Submit</Button>
      </DialogActions>
      </div>
    </Dialog>
  );
}