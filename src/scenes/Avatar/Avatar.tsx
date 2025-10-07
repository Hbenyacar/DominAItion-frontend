import React, { useState } from "react";
import './Avatar.css'
import { Avatar, Button } from "@mui/material";
import ButtonBase from '@mui/material/ButtonBase';
import { useDispatch, UseDispatch, useSelector } from "react-redux";
import { setAvatar } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";

function AvatarSelect() {
    const avatarImages = [
        "Default Profile Icons/boy.png",
        "Default Profile Icons/girl.png",
        "Default Profile Icons/woman.png",
        "Default Profile Icons/man.png",
    ];

    const [avatarSrc, setAvatarSrc] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);

    const setNewAvatar = (src: string) => {
        setAvatarSrc(src);
        dispatch(setAvatar(src));
    }

    const handleSubmit = async () => {
        try {
            console.log("ID: " + user.id);
          const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: user.username ?? "",   // keep existing values so nothing gets overwritten
              bio: user.bio ?? "",
              icon: avatarSrc,           // update this field
              public: user.public ?? "",       // if this field exists
            }),
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to update user:", errorText);
            return;
          }
      
          const updatedUser = await response.json();
          console.log(updatedUser);
          console.log(updatedUser.icon);
          dispatch(setAvatar(avatarSrc));
          navigate("/home");
        } catch (err) {
          console.error("Error updating user:", err);
        }
      };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
        // Read the file as a data URL
        const reader = new FileReader();
        reader.onload = () => {
            const newAvatar = reader.result as string;
            setAvatarSrc(newAvatar);
            dispatch(setAvatar(newAvatar));
        };
        reader.readAsDataURL(file);
        }
    };

    return (

        <div className="avatar-container">
            <Avatar
                alt="User Avatar"
                src={avatarSrc}
                sx={{ width: 170, height: 170 }}
            />

      <Button
      component="label">
        Upload Custom Avatar
        <input
        type="file"
        accept="image/*"
        style={{
          border: 0,
          clip: 'rect(0 0 0 0)',
          height: '1px',
          margin: '-1px',
          overflow: 'hidden',
          padding: 0,
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px',
        }}
        onChange={handleAvatarChange}
      />
      </Button>

            <div className="avatar-row">
                {avatarImages.map((src, index) => (
                <Avatar
                    key={index}
                    alt={`Avatar ${index + 1}`}
                    src={src}
                    onClick={() => setNewAvatar(src)}
                    sx={{ width: 50, height: 50, cursor: 'pointer' }}
                    className="avatar-option"
                />
                ))}
            </div>

            <div className="buttons">
                <Button
                onClick={() => {handleSubmit()}}
                >
                    Skip
                </Button>
                <Button
                disabled={avatarSrc == ""}
                onClick={() => {handleSubmit()}}
                >
                    Submit
                </Button>
            </div>

        </div>


        
    );
}

export default AvatarSelect;