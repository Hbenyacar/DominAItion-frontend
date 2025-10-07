import './World.css'

function World() {

    const handleClick = (panelName: string) => {
        alert(`You clicked ${panelName}`);
    };

    return (
        <div className="panel-container">
            <div className="panel-button" onClick={() => handleClick("Panel 1")}>
                Use A Predefined World
            </div>
            <div className="panel-button" onClick={() => handleClick("Panel 2")}>
                Generate a Custom World
            </div>
            <div className="panel-button" onClick={() => handleClick("Panel 3")}>
                Create a randomly generated world
            </div>
        </div>
    );
}

export default World;