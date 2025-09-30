import Navbar from "../navbar/NavBar";
import InteractiveUSMap from "../../widgets/Maps/USA/USA"
import "./Game.css"
function Game() {
    return (
        <div>
            <Navbar/>
            <div className="content">
                <div className="game-chat">
                    <div>Game Chat</div>
                </div>
                <div className="img">
                    <img src="USMap.png" width="800" height="auto" />
                </div>
                <div className="game-chat">
                    <div>Story Board</div>
                </div>

            </div>
            
        </div>
    );
}

export default Game;