import React from 'react';
import './index.css';
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Inicio</div>} />
      <Route path="/test" element={<div>Ruta de prueba</div>} />
    </Routes>
  );
}
