import './App.css';
import React from 'react';
import BombRoom from './pages/BombRoom';
import Header from './pages/Header';
import Footer from './pages/Footer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<BombRoom />} />
          <Route path="*" element={<BombRoom />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
