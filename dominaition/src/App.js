import logo from './logo.svg';
import './App.css';
import Register from './Pages/Register.tsx';
import Login from './Pages/Login.tsx';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
