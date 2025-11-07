import { Box, Typography } from "@mui/material";
import Navbar from "../navbar/NavBar";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

// Each achievement has a threshold (number), color + black images, and optional unlockDate + message
const achievements = [
  {
    number: 1,
    colorSrc: "/achievements/1color.png",
    blackSrc: "/achievements/1black.png",
    date: "2025-11-01",
    message: "Unlocked your first win! Great start!",
  },
  {
    number: 3,
    colorSrc: "/achievements/3color.png",
    blackSrc: "/achievements/3black.png",
    date: "2025-11-03",
    message: "Consistency pays off — 3 wins achieved!",
  },
  {
    number: 10,
    colorSrc: "/achievements/10color.png",
    blackSrc: "/achievements/10black.png",
    date: "2025-11-06",
    message: "You’ve reached 10 wins! A true champion!",
  },
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
      <Box
        className="content"
        sx={{
          flex: 1,
          padding: "100px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // ✅ align everything to the left
          justifyContent: "flex-start",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#2c2c2c",
            mb: 4,
          }}
        >
          Achievements
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // ✅ no centering inside child box either
            width: "100%",
          }}
        >
          {achievements.map((achievement, index) => {
            const achieved = wins >= achievement.number;
            return (
              <Box
                key={index}
                sx={{
                  mb: 6,
                  textAlign: "left", // ✅ left-align text
                }}
              >
                {/* Image */}
                <Box
                  component="img"
                  src={achieved ? achievement.colorSrc : achievement.blackSrc}
                  alt={`Achievement ${index + 1}`}
                  sx={{
                    width: "260px",
                    height: "auto",
                    borderRadius: "20px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                    mb: 2,
                    opacity: achieved ? 1 : 0.6,
                    display: "block", // ✅ ensures image respects left alignment
                  }}
                />

                {/* Show unlock info only if achieved */}
                {achieved && (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "#2e7d32",
                        fontWeight: 600,
                        mt: 1,
                      }}
                    >
                      {achievement.message}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#888",
                        fontStyle: "italic",
                        mt: 0.5,
                      }}
                    >
                      Unlocked on{" "}
                      {new Date(achievement.date).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Typography>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default Achievements;
