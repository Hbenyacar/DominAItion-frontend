
import './App.css';

import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Register from './scenes/Register/Register';
import Login from './scenes/Login/Login';
import Home from './scenes/Home/Home';
import Game from './scenes/Game/Game';
import Profile from './scenes/Profile/Profile';
import Landing from './scenes/Landing/Landing';
import AvatarSelect from './scenes/Avatar/Avatar';
import Europe from './widgets/Maps/USA/Europe';
import Sample from './scenes/Sample/Sample';
import ResetPassword from './scenes/Profile/ResetPassword';
import World from './scenes/World/World';
import Lobby from './scenes/Lobby/Lobby';


function App() {
  const location = useLocation();

  useEffect(() => {
    // 🛑 Stop any music when leaving the Game page
    if (location.pathname !== "/game") {
      // @ts-ignore
      const globalAudio = window.globalGameAudio || null;
      if (globalAudio && !globalAudio.paused) {
        globalAudio.pause();
        globalAudio.currentTime = 0;
        // @ts-ignore
        window.globalGameAudio = null;
      }

      // 🛑 Also pause any <audio> elements in case others exist
      const audios = document.getElementsByTagName("audio");
      for (const audio of audios) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [location.pathname]);

  return (
    <>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home/>} />
        <Route path="/game" element={<Game/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path='/' element={<Landing/>} />
        <Route path='/avatar' element={<AvatarSelect/>} />
        <Route path='/europe' element={<Europe/>} />
        <Route path='/sample' element={<Sample/>} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path='/world' element={<World/>} />
        <Route path='/lobby/:lobbyId' element={<Lobby/>} />
      </Routes>
    </>
  );
}

export default App;
