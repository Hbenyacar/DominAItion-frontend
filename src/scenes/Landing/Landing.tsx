import React from "react";
import "./Landing.css";
import { useNavigate } from "react-router-dom";

const Landing: React.FC = () => {
    const navigate = useNavigate();

    const toRegister = () => {
        navigate('/register');
    }

  return (
    <div className="landing-root">
      <section className="hero">
        <h1>Unleash Your Imagination</h1>
        <p>
          Enter a strategy game with no limits. Powered by AI,{" "}
          <strong>DominAItion</strong> lets you invent your own armies, weapons, 
          and worlds — and fight to conquer them all.
        </p>
        <button className="play-btn" onClick={() => toRegister()}>Play Now</button>

        <div className="features">
          <div className="feature">
            <h3>🎨 Creative Freedom</h3>
            <p>
              Invent anything — from fantasy armies to futuristic tech. 
              No restrictions, just your imagination.
            </p>
          </div>
          <div className="feature">
            <h3>🤖 AI-Powered Worlds</h3>
            <p>
              Our AI adapts to your choices, generating challenges and 
              stories tailored to your playstyle.
            </p>
          </div>
          <div className="feature">
            <h3>♾️ Infinite Replayability</h3>
            <p>
              Every session is unique, with dynamic maps, characters, 
              and outcomes waiting to be conquered.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
