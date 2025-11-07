import { Box, Typography, Modal } from "@mui/material";
import Navbar from "../navbar/NavBar";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const achievements = [
  {
    number: 1,
    colorSrc: "/achievements/1color.png",
    blackSrc: "/achievements/1black.png",
    date: "2025-11-07",
    message: "Unlocked your first win! Great start!",
  },
  {
    number: 3,
    colorSrc: "/achievements/3color.png",
    blackSrc: "/achievements/3black.png",
    date: "2025-11-08",
    message: "Consistency pays off — 3 wins achieved!",
  },
  {
    number: 10,
    colorSrc: "/achievements/10color.png",
    blackSrc: "/achievements/10black.png",
    date: "2025-11-10",
    message: "Not unlocked yet",
  },
];

function Achievements() {
  const wins = useSelector((state: RootState) => state.auth.wins);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    console.log("wins: " + wins);
  }, [wins]);

  const handleOpen = (index: number) => setSelected(index);
  const handleClose = () => setSelected(null);

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

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {achievements.map((achievement, index) => {
              const achieved = wins >= achievement.number;
              return (
                <Box
                  key={index}
                  onClick={() => handleOpen(index)}
                  sx={{
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <Box
                    component="img"
                    src={achieved ? achievement.colorSrc : achievement.blackSrc}
                    alt={`Achievement ${achievement.number}`}
                    sx={{
                      width: "200px",
                      height: "auto",
                      borderRadius: "20px",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                      opacity: achieved ? 1 : 0.6,
                    }}
                  />

                  {/* Show unlock info only if achieved */}
                  {achieved && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#888",
                        fontStyle: "italic",
                        mt: 1,
                      }}
                    >
                      Unlocked on{" "}
                      {new Date(achievement.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Modal for clicked achievement */}
          <Modal open={selected !== null} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                p: 4,
                width: "400px",
                textAlign: "center",
              }}
            >
              {selected !== null && (
                <>
                  <Box
                    component="img"
                    src={
                      wins >= achievements[selected].number
                        ? achievements[selected].colorSrc
                        : achievements[selected].blackSrc
                    }
                    alt={`Achievement ${achievements[selected].number}`}
                    sx={{
                      width: "220px",
                      borderRadius: "16px",
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Achievement #{achievements[selected].number}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {achievements[selected].message}
                  </Typography>

                  {wins >= achievements[selected].number && (
                    <Typography
                      variant="body2"
                      sx={{ color: "#666", fontStyle: "italic" }}
                    >
                      Unlocked on{" "}
                      {new Date(
                        achievements[selected].date
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Modal>
        </Box>
      </Box>
    </Box>
  );
}

export default Achievements;
