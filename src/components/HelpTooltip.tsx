import { useState } from "react";
import { IconButton, Tooltip, Popover, Box, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export default function HelpTooltip({ description }: { description: string }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title="What is this?">
        <IconButton
          size="small"
          sx={{ color: "white" }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            p: 2,
            backgroundColor: "rgba(20,20,20,0.9)",
            color: "white",
            borderRadius: "12px",
            maxWidth: 250,
          },
        }}
      >
        <Typography variant="body2">{description}</Typography>
      </Popover>
    </>
  );
}
