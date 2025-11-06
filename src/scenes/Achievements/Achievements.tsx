import { Box, Typography } from "@mui/material";
import Navbar from "../navbar/NavBar";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const achievements = [
  {
    number: 1,
    colorSrc: "/achievements/1color.png",
    blackSrc: "/achievements/1black.png",
    text: "You’ve earned your first achievement! Keep playing and exploring to unlock more milestones and badges.",
  },
  {
    number: 3,
    colorSrc: "/achievements/3color.png",
    blackSrc: "/achievements/3black.png",
    text: "Third achievement achieved! Your progress is impressive.",
  },
  {
    number: 10,
    colorSrc: "/achievements/10color.png",
    blackSrc: "/achievements/10black.png",
    text: "Tenth achievement unlocked! Keep going to earn more rewards.",
  },
  // Add more achievements here as needed
];

function Achievements() {
  const wins = useSelector((state: RootState) => state.auth.wins);

  useEffect(() => {
    console.log("wins: " + wins);
  }, [wins]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <Navbar />
      <Box className="page">
        <Box
          className="content"
          sx={{
            flex: 1,
            padding: "80px 60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#2c2c2c",
              mb: 4,
              alignSelf: "flex-start",
            }}
          >
            Achievements
          </Typography>

          {achievements.map((achievement, index) => (
            <Box key={index} sx={{ mb: 6, textAlign: "center" }}>
              {/* Achievement Image */}
              <Box
                component="img"
                src={wins >= achievement.number ? achievement.colorSrc : achievement.blackSrc}
                alt={`Achievement ${index + 1}`}
                sx={{
                  width: "260px",
                  height: "auto",
                  borderRadius: "20px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                  mb: 3,
                }}
              />

              {/* Text */}
              <Typography
                variant="body1"
                sx={{
                  color: "#555",
                  maxWidth: "480px",
                  textAlign: "center",
                  lineHeight: 1.6,
                  fontSize: "1.05rem",
                }}
              >
                {achievement.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Achievements;
