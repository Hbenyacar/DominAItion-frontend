import React, { useState } from "react";
import {
  Box,
  Typography,
  Slider,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

const AIPlayerSettings = () => {
  const [value, setValue] = useState(1); // 1 = Easy, 2 = Medium, 3 = Hard
  const [playstyle, setPlaystyle] = useState("Defensive");

  const labels = ["Easy", "Medium", "Hard"];
  const playstyles = ["Aggressive", "Avoidant", "Defensive"];

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  const handlePlaystyleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPlaystyle(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={"bold"} sx={{ mb: "10px" }}>
        AI Player Settings
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 5,
          alignItems: "flex-start",
          flexWrap: "wrap", // responsive on smaller screens
        }}
      >
        {/* Difficulty Section */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            AI Player Difficulty: {labels[value - 1]}
          </Typography>

          <Slider
            value={value}
            min={1}
            max={3}
            step={1}
            marks={[
              { value: 1, label: "Easy" },
              { value: 2, label: "Medium" },
              { value: 3, label: "Hard" },
            ]}
            onChange={handleSliderChange}
            sx={{
              color: "rgb(207, 78, 10)",
              "& .MuiSlider-thumb": { width: 20, height: 20 },
              marginLeft: "10px",
            }}
          />
        </Box>

        {/* Playstyle Section */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            AI Player Playstyle: {playstyle}
          </Typography>

          <RadioGroup
            row
            name="playstyle"
            value={playstyle}
            onChange={handlePlaystyleChange}
          >
            {playstyles.map((style) => (
              <FormControlLabel
                key={style}
                value={style}
                control={<Radio color="primary" />}
                label={
                  <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                    {style}
                  </Typography>
                }
                sx={{
                  mr: 2,
                  "& .Mui-checked": {
                    color: "rgb(207, 78, 10)",
                  },
                }}
              />
            ))}
          </RadioGroup>
        </Box>
      </Box>
    </Box>
  );
};

export default AIPlayerSettings;
