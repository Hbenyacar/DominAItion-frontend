import React, { useEffect, useState } from "react";
import "./Avatar.css";
import { Avatar, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setAvatar } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";

// Helper: Convert an image URL to a base64 string
const imageToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function AvatarSelect() {
  // Default image paths (relative)
  const defaultAvatars = ["/boy.png", "/girl.png", "/woman.png", "/man.png"];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [avatarSrc, setAvatarSrc] = useState<string>(
    user.icon || ""
  );
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  // Convert default images to base64 when component mounts
  useEffect(() => {
    const convertImages = async () => {
      const promises = defaultAvatars.map(async (path) => {
        try {
          const base64 = await imageToBase64(path);
          return base64;
        } catch (err) {
          console.error("Error converting image:", path, err);
          return "";
        }
      });
      const base64Images = await Promise.all(promises);
      setAvatarOptions(base64Images.filter((img) => img !== ""));
    };

    convertImages();
  }, []);

  const setNewAvatar = (src: string) => {
    setAvatarSrc(src);
    dispatch(setAvatar(src));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newAvatar = reader.result as string;
        setAvatarSrc(newAvatar);
        dispatch(setAvatar(newAvatar));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username ?? "",
          bio: user.bio ?? "",
          icon: avatarSrc,
          public: user.public ?? true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update user:", errorText);
        return;
      }

      const updatedUser = await response.json();
      console.log("Updated user:", updatedUser);
      dispatch(setAvatar(avatarSrc));
      navigate("/home");
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  return (
    <div className="avatar-container">
      {/* Main Avatar Preview */}
      <Avatar
        alt="User Avatar"
        src={avatarSrc}
        sx={{
          width: 170,
          height: 170,
          borderRadius: "50%",
          border: "3px solid #ccc",
          marginBottom: "20px",
        }}
      />

      <Button component="label" sx={{ mb: 2 }}>
        Upload Custom Avatar
        <input
          type="file"
          accept="image/*"
          style={{
            border: 0,
            clip: "rect(0 0 0 0)",
            height: "1px",
            margin: "-1px",
            overflow: "hidden",
            padding: 0,
            position: "absolute",
            whiteSpace: "nowrap",
            width: "1px",
          }}
          onChange={handleAvatarChange}
        />
      </Button>

      {/* Default Avatar Options (now base64) */}
      <div className="avatar-row" style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        {avatarOptions.map((src, index) => (
          <Avatar
            key={index}
            alt={`Avatar ${index + 1}`}
            src={src}
            onClick={() => setNewAvatar(src)}
            sx={{
              width: 70,
              height: 70,
              cursor: "pointer",
              borderRadius: "50%",
              border: avatarSrc === src ? "3px solid #1976d2" : "2px solid transparent",
              transition: "border 0.2s ease-in-out",
            }}
          />
        ))}
      </div>

      <div className="buttons" style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
        <Button onClick={handleSubmit}>Skip</Button>
        <Button disabled={!avatarSrc} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  );
}

export default AvatarSelect;
