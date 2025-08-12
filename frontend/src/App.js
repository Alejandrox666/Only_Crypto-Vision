import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import Dashboard from './components/Dashboard.jsx'; // Necesitarás crear este archivo
import { authService } from './services/authService';
import Formulario from './components/formulario/formulario.jsx'
import './App.css';
import Dash from './components/Dash/Dash.jsx';

const PrivateRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dash" element={<Dash />} />
        <Route path="/form" element={<Formulario />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
       
        <Route path="/" element={<Navigate to="/dash" />} />
      </Routes>
    </Router>
  );
}

export default App;