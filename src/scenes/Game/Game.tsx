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
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleCloseModal = () => setShowModal(false);

    const tutorialSlides = [
        {
            title: "Welcome to DominAItion!",
            content: "Here is a short tutorial to get you started..."
        },
        {
            title: "Your Mission (Should you choose to accept it)",
            content: "Take over the world! You and the other players have a map divided out into regions." +
                "You will think of unique actions you can take to gain more territory. " +
                "With each territory you take over, you gain more points." +
                "The first one to get to the set number of points wins the game!"
        },
        {
            title: "All About The Map",
            content: "The map is divided into several regions you can take over. The resources and terrain in each region is determined based on the world description created on game creation"
        },
        {
            title: "Who ARE you?",
            content: "The character you defined at the beginning of the game will have different traits that can make the actions you want to take more or less feasible. Plan your domination strategies wisely!"
        },
        {
            title: "Good luck, and have fun!",
        }
    ];

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
    };

    const handleNextSlide = () => {
        setCurrentSlide((prev) => Math.min(prev + 1, tutorialSlides.length - 1));
    };


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
        {/* Tutorial Modal */}
        {showModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>{tutorialSlides[currentSlide].title}</h2>
                    <h3>{tutorialSlides[currentSlide].content}</h3>

                    <div className="modal-navigation">
                        <button onClick={handlePrevSlide} disabled={currentSlide === 0}>
                            ←
                        </button>
                        <button onClick={handleNextSlide} disabled={currentSlide === tutorialSlides.length - 1}>
                            →
                        </button>
                    </div>


                    <button className="close-button" onClick={handleCloseModal}>
                        {currentSlide == tutorialSlides.length - 1? "Close" : "Skip Tutorial"}
                    </button>

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
