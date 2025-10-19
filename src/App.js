
import './App.css';
import Register from './scenes/Register/Register';
import Login from './scenes/Login/Login';
import { Routes, Route } from 'react-router-dom';
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
  return (
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
      <Route path='/lobby' element={<Lobby/>} />
    </Routes>
  );
}

export default App;
