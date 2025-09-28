
import './App.css';
import Register from './scenes/Register/Register';
import Login from './scenes/Login/Login';
import { Routes, Route } from 'react-router-dom';
import Home from './scenes/Home/Home';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home/>} />
    </Routes>
  );
}

export default App;
