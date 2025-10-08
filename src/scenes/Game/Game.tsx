import {useState} from "react";
import {useEffect} from "react";
import { useSelector } from "react-redux";
import InteractiveUSMap from "../../widgets/Maps/USA/USA";
import PlayerActionInput from "../../widgets/PlayerActionInput/PlayerActionInput";
import Navbar from "../navbar/NavBar";
import { RootState } from "../../store/store";
import "./Game.css";
import Europe from "../../widgets/Maps/USA/Europe";


function Game() {
  const map = useSelector((state: RootState) => state.map.map);
    const [showModal, setShowModal] = useState(true);

    const handleCloseModal = () => setShowModal(false);

    useEffect(() => {
        const modalShown = sessionStorage.getItem("modalShown");
        if (!modalShown) {
            setShowModal(true);
            sessionStorage.setItem("modalShown", "true");
        }
    }, []);


    return (
    <div className="game-page">
      <Navbar />

        {/*Tutorial Modal */}
        {showModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Hello</h2>
                    <button onClick={handleCloseModal}>Close</button>
                </div>
            </div>
        )}

      {/* Outer wrapper: full viewport width */}
      <div className="content-wrapper">
  <div className="content">
    {/* Left box */}
    <div
      className="game-chat"
      style={{
        marginLeft: map === "Medieval Europe" ? "70px" : map === "USA" ? "50px" : "10px",
      }}
    >
      Game Chat
    </div>

    {/* Center map */}
    <div className="map-wrapper"
    style={{
      marginLeft: map === "Medieval Europe" ? "-100px" : "0px",
    }}>
      {map === "USA" && <InteractiveUSMap />}
      {map === "Medieval Europe" && <Europe/>}
      {/* other maps */}
    </div>

    {/* Right box */}
    <div
      className="game-chat"
      style={{
        marginRight: map === "Medieval Europe" ? "70px" : map === "USA" ? "50px" : "10px",
      }}
    >
      Story Board
    </div>
  </div>

</div >
      <div  style={{
      marginTop: "20px",
    }}>
      <PlayerActionInput/>
      </div>
    </div>
  );
}

export default Game;
