
import './App.css';
import Register from './scenes/Register/Register';
import Login from './scenes/Login/Login';
import { Routes, Route } from 'react-router-dom';
import Home from './scenes/Home/Home';
import Game from './scenes/Game/Game';
import Profile from './scenes/Profile/Profile';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home/>} />
      <Route path="/game" element={<Game/>} />
      <Route path="/profile" element={<Profile/>} />
    </Routes>
  );
}

export default App;
