import { useEffect, useState, } from "react";
import "./WinPopup.css";

interface WinPopupProps {
    message?: string; // 👈 new optional message prop
    wonGame: boolean;
  }
  
  export default function WinPopup({ wonGame, message }: WinPopupProps) {
  const [visible, setVisible] = useState(false);
  

  useEffect(() => {
    if (wonGame) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [wonGame]);

  if (!visible) return null;

  return (
    <div className="win-popup">
      {message}
    </div>
  );
}
