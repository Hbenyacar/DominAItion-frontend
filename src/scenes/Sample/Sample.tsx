import SampleInteractiveUSMap from "../../widgets/Maps/USA/Sample USA";
import PlayerActionInput from "../../widgets/PlayerActionInput/PlayerActionInput";
import Navbar from "../navbar/NavBar";
import "./Sample.css";

function Sample() {
  const players = [
  { id: "player1", name: "Alice", color: "#ff0000", score: 68, icon: "/girl.png", myTurn: false },
  { id: "player2", name: "Bob", color: "#00ff00", score: 6, icon: "/boy.png", myTurn: false },
  { id: "player3", name: "Charlie", color: "#0000ff", score: 30, icon: "/man.png", myTurn: true },
  { id: "player4", name: "Diana", color: "#ffff00", score: 63, icon: "/woman.png", myTurn: false },
];
  return (
    <div className="game-page">
      <Navbar />

      {/* Outer wrapper: full viewport width */}
      <div className="content-wrapper">
        <div className="player-bar">
          {players.map((player) => (
            <div key={player.id} id={player.id} className="player-box" style={{ backgroundColor: player.color, border: player.myTurn ? "7px solid gold" : "2px solid black",}}>
              <img src={player.icon} alt={`${player.name} icon`} className="player-icon" />
              <span>
                {player.name}: {player.score} {player.score === 1 ? "pt" : "pts"}
              </span>
            </div>
          ))}
        </div>
        {/* Force content to be a flex row, independent of parent */}
        <div className="content">
          
          <div className="game-chat">Game Chat:<br /><br />
            Alice joined<br />
            Bob joined<br />
            Charlie joined<br />
            Diana joined<br /><br />
            Alice: Good luck!<br />
            Charlie: You too!
          </div>
          <div> <SampleInteractiveUSMap/></div>
          <div className="game-chat">Story Board:<br /><br />
            Turn 1: Alice expanded her armies into Oregon and Nevada and successfully took control of both states<br /><br />
            Turn 2: Bob formed an alliance between North and South Dakota to secure control over Mt. Rushmore
            </div>
        </div>
      </div>
      <PlayerActionInput/>
    </div>
  );
}

export default Sample;
