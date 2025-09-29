import React, {useEffect, useState, useRef} from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

interface SimplePopupProps {
    open: boolean;
    onClose: () => void;
  }

function CreateGame({open, onClose }: SimplePopupProps) {
    return(
        <div>

      <Dialog open={open} onClose={onClose}>
        <DialogTitle>My Popup</DialogTitle>
        <DialogContent>
          <p>This is a simple popup window!</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
    );
}

export default CreateGame;