import InteractiveUSMap from "../../widgets/Maps/USA/USA";
import PlayerActionInput from "../../widgets/PlayerActionInput/PlayerActionInput";
import Navbar from "../navbar/NavBar";
import "./Game.css";

function Game() {
  return (
    <div className="game-page">
      <Navbar />

      {/* Outer wrapper: full viewport width */}
      <div className="content-wrapper">
        {/* Force content to be a flex row, independent of parent */}
        <div className="content">
          <div className="game-chat">Game Chat</div>
          <div> <InteractiveUSMap/></div>
          <div className="game-chat">Story Board</div>
        </div>
      </div>
      <PlayerActionInput/>
    </div>
  );
}

export default Game;
